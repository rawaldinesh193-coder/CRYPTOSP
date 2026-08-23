import { Router, Response } from 'express';
import { prisma } from '@cryptosp/database';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/v1/transactions
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const walletId = req.user!.walletId;
    const { type, status, asset, search, limit = '20', page = '1' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {
      OR: [
        { senderId: userId },
        { recipientId: userId },
        { senderWalletId: walletId },
        { recipientWalletId: walletId },
      ],
    };

    if (type) whereClause.type = type as string;
    if (status) whereClause.status = status as string;
    if (asset) whereClause.asset = asset as string;

    if (search) {
      const s = search as string;
      whereClause.AND = [
        {
          OR: [
            { id: { contains: s, mode: 'insensitive' } },
            { senderWalletId: { contains: s, mode: 'insensitive' } },
            { recipientWalletId: { contains: s, mode: 'insensitive' } },
            { reference: { contains: s, mode: 'insensitive' } },
            { note: { contains: s, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.ledgerTransaction.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip,
        include: {
          sender: { select: { username: true, fullName: true } },
          recipient: { select: { username: true, fullName: true } },
        },
      }),
      prisma.ledgerTransaction.count({ where: whereClause }),
    ]);

    return res.json({
      success: true,
      data: {
        transactions: transactions.map((t) => ({
          id: t.id,
          type: t.type,
          status: t.status,
          senderId: t.senderId,
          senderWalletId: t.senderWalletId,
          senderName: t.sender?.fullName || t.sender?.username,
          recipientId: t.recipientId,
          recipientWalletId: t.recipientWalletId,
          recipientName: t.recipient?.fullName || t.recipient?.username,
          asset: t.asset,
          amount: t.amount.toString(),
          fee: t.fee.toString(),
          reference: t.reference,
          note: t.note,
          reason: t.reason,
          reversalOfId: t.reversalOfId,
          createdAt: t.createdAt,
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

// GET /api/v1/transactions/:id
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const transaction = await prisma.ledgerTransaction.findUnique({
      where: { id },
      include: {
        entries: true,
        sender: { select: { username: true, fullName: true, email: true } },
        recipient: { select: { username: true, fullName: true, email: true } },
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Transaction not found' },
      });
    }

    // Check authorization: must be sender, recipient, or admin
    const isUserParticipant = transaction.senderId === userId || transaction.recipientId === userId;
    const isAdmin = req.user!.role !== 'USER';

    if (!isUserParticipant && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied to this transaction record' },
      });
    }

    return res.json({
      success: true,
      data: {
        ...transaction,
        amount: transaction.amount.toString(),
        fee: transaction.fee.toString(),
        entries: transaction.entries.map((e) => ({
          ...e,
          amount: e.amount.toString(),
        })),
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

export const transactionRouter = router;
