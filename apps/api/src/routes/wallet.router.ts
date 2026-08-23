import { Router, Response } from 'express';
import { prisma, ledgerService } from '@cryptosp/database';
import { TransferSchema, PaymentRequestSchema } from '@cryptosp/validation';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';
import Decimal from 'decimal.js';

const router = Router();

// Get configured Phoenix Coin USD price from system settings or database
async function getPhoenixPriceUsd(): Promise<number> {
  const settings = await prisma.systemSettings.findFirst();
  if (settings) {
    return Number(settings.phoenixCoinPriceUsd.toString());
  }
  return 10.00;
}

// GET /api/v1/wallets/me
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userWallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!userWallet) {
      return res.status(404).json({
        success: false,
        error: { code: 'WALLET_NOT_FOUND', message: 'Wallet not found' },
      });
    }

    const phoenixPrice = await getPhoenixPriceUsd();
    const rawBalances = await ledgerService.getWalletBalances(userId);

    // Mock/External crypto prices for USD portfolio calculation (fallback rates)
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

// POST /api/v1/transfers/send
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

// GET /api/v1/payments/resolve/:walletId
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

// POST /api/v1/payments/request
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
