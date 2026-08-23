import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { LedgerService } from '../services/ledger.service';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';
import Decimal from 'decimal.js';

const router = Router();
const prisma = new PrismaClient();
const ledgerService = new LedgerService(prisma);

const TransferSchema = z.object({
  recipientWalletId: z.string().regex(/^CSP-[A-Z0-9]{12}$/),
  asset: z.string().min(2),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0),
  note: z.string().max(200).optional(),
  idempotencyKey: z.string().optional(),
});

const PaymentRequestSchema = z.object({
  asset: z.string().default('PHX'),
  amount: z.string().optional(),
  reference: z.string().optional(),
});

async function getPhoenixPriceUsd(): Promise<number> {
  const settings = await prisma.systemSettings.findFirst();
  return settings ? Number(settings.phoenixCoinPriceUsd.toString()) : 10.00;
}

router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userWallet = await prisma.wallet.findUnique({ where: { userId } });

    if (!userWallet) {
      return res.status(404).json({
        success: false,
        error: { code: 'WALLET_NOT_FOUND', message: 'Wallet not found' },
      });
    }

    const phoenixPrice = await getPhoenixPriceUsd();
    const rawBalances = await ledgerService.getWalletBalances(userId);

    const priceRates: Record<string, number> = {
      PHX: phoenixPrice,
      BTC: 64250.00,
      ETH: 3480.00,
      USDT: 1.00,
      SOL: 145.00,
    };

    let totalPortfolioUsd = new Decimal(0);
    const formattedBalances: Record<string, any> = {};

    for (const [asset, bal] of Object.entries(rawBalances)) {
      const price = priceRates[asset] || 0;
      const usdVal = new Decimal(bal.available).mul(price);
      totalPortfolioUsd = totalPortfolioUsd.add(usdVal);

      formattedBalances[asset] = {
        available: bal.available,
        pending: bal.pending,
        total: bal.total,
        usdValue: usdVal.toFixed(2),
      };
    }

    return res.json({
      success: true,
      data: {
        id: userWallet.id,
        walletId: userWallet.walletId,
        isFrozen: userWallet.isFrozen || req.user!.isFrozen,
        phoenixCoinPriceUsd: phoenixPrice,
        balances: formattedBalances,
        totalPortfolioUsd: totalPortfolioUsd.toFixed(2),
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

router.post('/send', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = TransferSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parse.error.errors[0].message },
      });
    }

    const { recipientWalletId, asset, amount, note, idempotencyKey } = parse.data;
    const headerIdempotencyKey = (req.headers['idempotency-key'] as string) || idempotencyKey;

    const transaction = await ledgerService.executeTransfer({
      senderId: req.user!.id,
      recipientWalletId,
      asset: asset.toUpperCase(),
      amountStr: amount,
      note,
      idempotencyKey: headerIdempotencyKey,
    });

    return res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'TRANSFER_FAILED', message: err.message || 'Transfer execution failed' },
    });
  }
});

router.get('/payments/resolve/:walletId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { walletId } = req.params;
    const targetWallet = await prisma.wallet.findUnique({
      where: { walletId },
      include: { user: true },
    });

    if (!targetWallet || !targetWallet.user) {
      return res.status(404).json({
        success: false,
        error: { code: 'WALLET_NOT_FOUND', message: `Recipient Wallet ID '${walletId}' not found.` },
      });
    }

    return res.json({
      success: true,
      data: {
        walletId: targetWallet.walletId,
        username: targetWallet.user.username,
        fullName: targetWallet.user.fullName,
        isFrozen: targetWallet.isFrozen || targetWallet.user.isFrozen,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

router.post('/payments/request', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = PaymentRequestSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parse.error.errors[0].message },
      });
    }

    const { asset, amount, reference } = parse.data;
    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        userId: req.user!.id,
        walletId: req.user!.walletId,
        asset,
        amount: amount ? new Decimal(amount).toFixed(18) : null,
        reference,
      },
    });

    return res.status(201).json({
      success: true,
      data: paymentRequest,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

export const walletRouter = router;
