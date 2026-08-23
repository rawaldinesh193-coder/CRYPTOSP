import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { LedgerService } from '../services/ledger.service';
import { authenticate, authorizeAdmin, AuthenticatedRequest } from '../middleware/auth.middleware';
import Decimal from 'decimal.js';

const router = Router();
const prisma = new PrismaClient();
const ledgerService = new LedgerService(prisma);

const AdminCreditSchema = z.object({
  userId: z.string().uuid(),
  asset: z.string().min(2),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0),
  reason: z.string().min(5),
});

const AdminReversalSchema = z.object({
  transactionId: z.string().uuid(),
  reason: z.string().min(5),
});

const AdminUpdateSettingsSchema = z.object({
  platformName: z.string().optional(),
  maintenanceMode: z.boolean().optional(),
  phoenixCoinPriceUsd: z.number().positive().optional(),
  minTransferAmount: z.number().nonnegative().optional(),
  maxTransferAmount: z.number().positive().optional(),
  platformFeePercentage: z.number().nonnegative().optional(),
  mfaRequiredForAdmin: z.boolean().optional(),
});

const AdminUserActionSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['FREEZE_WALLET', 'UNFREEZE_WALLET', 'SUSPEND_USER', 'UNSUSPEND_USER', 'RESTRICT_USER']),
  reason: z.string().min(3),
});

router.use(authenticate);
router.use(authorizeAdmin());

router.get('/overview', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      totalTransactions,
      todayTransactions,
      pendingCount,
      failedCount,
      reversedCount,
      settings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { accountStatus: 'ACTIVE' } }),
      prisma.user.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.ledgerTransaction.count(),
      prisma.ledgerTransaction.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.ledgerTransaction.count({ where: { status: 'PENDING' } }),
      prisma.ledgerTransaction.count({ where: { status: 'FAILED' } }),
      prisma.ledgerTransaction.count({ where: { status: 'REVERSED' } }),
      prisma.systemSettings.findFirst(),
    ]);

    const phxCreditSum = await prisma.ledgerEntry.aggregate({
      where: { asset: 'PHX', entryType: 'CREDIT' },
      _sum: { amount: true },
    });
    const phxDebitSum = await prisma.ledgerEntry.aggregate({
      where: { asset: 'PHX', entryType: 'DEBIT' },
      _sum: { amount: true },
    });

    const totalCredits = new Decimal(phxCreditSum._sum.amount?.toString() || '0');
    const totalDebits = new Decimal(phxDebitSum._sum.amount?.toString() || '0');
    const totalPhoenixSupply = totalCredits.minus(totalDebits).toFixed(4);

    return res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        totalPhoenixSupply,
        phoenixCoinPriceUsd: settings ? settings.phoenixCoinPriceUsd.toString() : '10.00',
        totalTransactions,
        todayTransactions,
        pendingCount,
        failedCount,
        reversedCount,
        systemHealth: {
          database: 'HEALTHY',
          ledgerEngine: 'OPERATIONAL',
          marketApi: 'ONLINE',
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, status, limit = '20', page = '1' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};
    if (status) whereClause.accountStatus = status as string;
    if (search) {
      const s = search as string;
      whereClause.OR = [
        { username: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { fullName: { contains: s, mode: 'insensitive' } },
        { wallet: { walletId: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: { wallet: true },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return res.json({
      success: true,
      data: {
        users: users.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          fullName: u.fullName,
          walletId: u.wallet?.walletId,
          role: u.role,
          accountStatus: u.accountStatus,
          verificationStatus: u.verificationStatus,
          isFrozen: u.isFrozen || u.wallet?.isFrozen,
          createdAt: u.createdAt,
        })),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

router.post('/users/action', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = AdminUserActionSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parse.error.errors[0].message },
      });
    }

    const { userId, action, reason } = parse.data;
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Target user not found' },
      });
    }

    let updatedUser;
    if (action === 'FREEZE_WALLET' || action === 'UNFREEZE_WALLET') {
      const isFrozen = action === 'FREEZE_WALLET';
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isFrozen },
      });
      if (targetUser.wallet) {
        await prisma.wallet.update({
          where: { id: targetUser.wallet.id },
          data: { isFrozen },
        });
      }
    } else if (action === 'SUSPEND_USER') {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { accountStatus: 'SUSPENDED' },
      });
    } else if (action === 'UNSUSPEND_USER') {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { accountStatus: 'ACTIVE' },
      });
    } else if (action === 'RESTRICT_USER') {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { accountStatus: 'RESTRICTED' },
      });
    }

    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        adminEmail: req.user!.email,
        action: `USER_${action}`,
        targetType: 'USER',
        targetId: userId,
        reason,
        newState: { action, accountStatus: updatedUser?.accountStatus, isFrozen: updatedUser?.isFrozen },
      },
    });

    return res.json({
      success: true,
      data: { message: `Action ${action} completed successfully`, user: updatedUser },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

router.post('/operations/deposit', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = AdminCreditSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parse.error.errors[0].message },
      });
    }

    const { userId, asset, amount, reason } = parse.data;

    const transaction = await ledgerService.executeAdminCredit({
      adminId: req.user!.id,
      adminEmail: req.user!.email,
      userId,
      asset: asset.toUpperCase(),
      amountStr: amount,
      reason,
    });

    return res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'OPERATION_FAILED', message: err.message },
    });
  }
});

router.post('/operations/reversal', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = AdminReversalSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parse.error.errors[0].message },
      });
    }

    const { transactionId, reason } = parse.data;

    const reversalTx = await ledgerService.executeAdminReversal({
      adminId: req.user!.id,
      adminEmail: req.user!.email,
      transactionId,
      reason,
    });

    return res.status(201).json({
      success: true,
      data: reversalTx,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'REVERSAL_FAILED', message: err.message },
    });
  }
});

router.get('/audit', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = '50', page = '1' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip: (pageNum - 1) * limitNum,
      }),
      prisma.auditLog.count(),
    ]);

    return res.json({
      success: true,
      data: {
        auditLogs,
        pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

router.get('/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await prisma.systemSettings.create({ data: {} });
    }
    return res.json({
      success: true,
      data: {
        ...settings,
        phoenixCoinPriceUsd: settings.phoenixCoinPriceUsd.toString(),
        minTransferAmount: settings.minTransferAmount.toString(),
        maxTransferAmount: settings.maxTransferAmount.toString(),
        platformFeePercentage: settings.platformFeePercentage.toString(),
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

router.put('/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = AdminUpdateSettingsSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parse.error.errors[0].message },
      });
    }

    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await prisma.systemSettings.create({ data: {} });
    }

    const updated = await prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        platformName: parse.data.platformName,
        maintenanceMode: parse.data.maintenanceMode,
        phoenixCoinPriceUsd: parse.data.phoenixCoinPriceUsd ? new Decimal(parse.data.phoenixCoinPriceUsd) : undefined,
        minTransferAmount: parse.data.minTransferAmount ? new Decimal(parse.data.minTransferAmount) : undefined,
        maxTransferAmount: parse.data.maxTransferAmount ? new Decimal(parse.data.maxTransferAmount) : undefined,
        platformFeePercentage: parse.data.platformFeePercentage ? new Decimal(parse.data.platformFeePercentage) : undefined,
        mfaRequiredForAdmin: parse.data.mfaRequiredForAdmin,
      },
    });

    if (parse.data.phoenixCoinPriceUsd) {
      await prisma.assetPrice.create({
        data: {
          asset: 'PHX',
          priceUsd: new Decimal(parse.data.phoenixCoinPriceUsd),
          createdBy: req.user!.id,
        },
      });
      await prisma.auditLog.create({
        data: {
          adminId: req.user!.id,
          adminEmail: req.user!.email,
          action: 'PHOENIX_PRICE_CHANGED',
          targetType: 'SYSTEM_SETTINGS',
          targetId: settings.id,
          reason: 'Admin updated Phoenix Coin reference price',
          newState: { newPrice: parse.data.phoenixCoinPriceUsd },
        },
      });
    }

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

export const adminRouter = router;
