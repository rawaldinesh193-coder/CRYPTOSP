import { PrismaClient, TransactionType, TransactionStatus, EntryType } from '@prisma/client';
import Decimal from 'decimal.js';

export class LedgerService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Calculates a user's exact balance for a specific asset by querying double-entry ledger entries.
   * Balance = SUM(CREDIT) - SUM(DEBIT)
   */
  async getUserBalance(userId: string, asset: string): Promise<{ available: Decimal; pending: Decimal; total: Decimal }> {
    const entries = await this.prisma.ledgerEntry.findMany({
      where: {
        userId,
        asset,
        transaction: {
          status: { in: [TransactionStatus.COMPLETED, TransactionStatus.PENDING] },
        },
      },
      include: {
        transaction: true,
      },
    });

    let completedCredit = new Decimal(0);
    let completedDebit = new Decimal(0);
    let pendingCredit = new Decimal(0);
    let pendingDebit = new Decimal(0);

    for (const entry of entries) {
      const amount = new Decimal(entry.amount.toString());
      if (entry.transaction.status === TransactionStatus.COMPLETED) {
        if (entry.entryType === EntryType.CREDIT) completedCredit = completedCredit.add(amount);
        if (entry.entryType === EntryType.DEBIT) completedDebit = completedDebit.add(amount);
      } else if (entry.transaction.status === TransactionStatus.PENDING) {
        if (entry.entryType === EntryType.CREDIT) pendingCredit = pendingCredit.add(amount);
        if (entry.entryType === EntryType.DEBIT) pendingDebit = pendingDebit.add(amount);
      }
    }

    const available = completedCredit.minus(completedDebit);
    const pending = pendingCredit.minus(pendingDebit);
    const total = available.add(pending);

    return { available, pending, total };
  }

  /**
   * Retrieves all asset balances for a user's wallet
   */
  async getWalletBalances(userId: string): Promise<Record<string, { available: string; pending: string; total: string }>> {
    const userWallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: { accounts: true },
    });

    if (!userWallet) {
      return {};
    }

    const balances: Record<string, { available: string; pending: string; total: string }> = {};

    // Get list of distinct assets user holds or standard assets
    const accounts = await this.prisma.account.findMany({
      where: { walletId: userWallet.id },
    });

    const assets = Array.from(new Set(['PHX', ...accounts.map((a) => a.asset)]));

    for (const asset of assets) {
      const bal = await this.getUserBalance(userId, asset);
      balances[asset] = {
        available: bal.available.toFixed(4),
        pending: bal.pending.toFixed(4),
        total: bal.total.toFixed(4),
      };
    }

    return balances;
  }

  /**
   * Executes an atomic user-to-user transfer using PostgreSQL transactions and double-entry accounting.
   */
  async executeTransfer(params: {
    senderId: string;
    recipientWalletId: string;
    asset: string;
    amountStr: string;
    note?: string;
    idempotencyKey?: string;
  }) {
    const { senderId, recipientWalletId, asset, amountStr, note, idempotencyKey } = params;
    const amount = new Decimal(amountStr);

    if (amount.lessThanOrEqualTo(0)) {
      throw new Error('Transfer amount must be strictly greater than zero.');
    }

    // 1. Check idempotency
    if (idempotencyKey) {
      const existingTx = await this.prisma.ledgerTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (existingTx) {
        return existingTx;
      }
    }

    // Execute atomic PostgreSQL transaction
    return await this.prisma.$transaction(async (tx) => {
      // Find sender user & wallet
      const sender = await tx.user.findUnique({
        where: { id: senderId },
        include: { wallet: true },
      });

      if (!sender || !sender.wallet) {
        throw new Error('Sender user or wallet not found.');
      }
      if (sender.isFrozen || sender.wallet.isFrozen || sender.accountStatus !== 'ACTIVE') {
        throw new Error('Sender account or wallet is currently frozen or restricted.');
      }

      // Find recipient wallet & user
      const recipientWallet = await tx.wallet.findUnique({
        where: { walletId: recipientWalletId },
        include: { user: true },
      });

      if (!recipientWallet || !recipientWallet.user) {
        throw new Error(`Recipient wallet ID '${recipientWalletId}' not found.`);
      }
      if (sender.wallet.walletId === recipientWalletId) {
        throw new Error('Cannot transfer funds to your own wallet ID.');
      }

      // Check sender balance using double-entry ledger query inside transaction
      const entries = await tx.ledgerEntry.findMany({
        where: {
          userId: senderId,
          asset,
          transaction: { status: TransactionStatus.COMPLETED },
        },
      });

      let completedCredit = new Decimal(0);
      let completedDebit = new Decimal(0);
      for (const entry of entries) {
        const amt = new Decimal(entry.amount.toString());
        if (entry.entryType === EntryType.CREDIT) completedCredit = completedCredit.add(amt);
        if (entry.entryType === EntryType.DEBIT) completedDebit = completedDebit.add(amt);
      }
      const availableBalance = completedCredit.minus(completedDebit);

      if (availableBalance.lessThan(amount)) {
        throw new Error(`Insufficient ${asset} balance. Available: ${availableBalance.toFixed(4)}, Required: ${amount.toFixed(4)}`);
      }

      // Get or create accounts for both users
      let senderAccount = await tx.account.findUnique({
        where: { walletId_asset: { walletId: sender.wallet.id, asset } },
      });
      if (!senderAccount) {
        senderAccount = await tx.account.create({
          data: { walletId: sender.wallet.id, asset, type: 'ASSET_HOLDING' },
        });
      }

      let recipientAccount = await tx.account.findUnique({
        where: { walletId_asset: { walletId: recipientWallet.id, asset } },
      });
      if (!recipientAccount) {
        recipientAccount = await tx.account.create({
          data: { walletId: recipientWallet.id, asset, type: 'ASSET_HOLDING' },
        });
      }

      // Create Master Ledger Transaction
      const transaction = await tx.ledgerTransaction.create({
        data: {
          idempotencyKey,
          type: TransactionType.TRANSFER,
          status: TransactionStatus.COMPLETED,
          senderId: sender.id,
          senderWalletId: sender.wallet.walletId,
          recipientId: recipientWallet.userId,
          recipientWalletId: recipientWallet.walletId,
          asset,
          amount: amount.toFixed(18),
          note,
        },
      });

      // Create Double-Entry Rows: DEBIT Sender, CREDIT Recipient
      await tx.ledgerEntry.createMany({
        data: [
          {
            transactionId: transaction.id,
            accountId: senderAccount.id,
            userId: sender.id,
            entryType: EntryType.DEBIT,
            asset,
            amount: amount.toFixed(18),
          },
          {
            transactionId: transaction.id,
            accountId: recipientAccount.id,
            userId: recipientWallet.userId,
            entryType: EntryType.CREDIT,
            asset,
            amount: amount.toFixed(18),
          },
        ],
      });

      // Create Notifications
      await tx.notification.createMany({
        data: [
          {
            userId: sender.id,
            title: 'Transfer Sent',
            message: `Sent ${amount.toFixed(4)} ${asset} to ${recipientWallet.walletId}`,
            type: 'TRANSFER_SENT',
          },
          {
            userId: recipientWallet.userId,
            title: 'Payment Received',
            message: `Received ${amount.toFixed(4)} ${asset} from ${sender.wallet.walletId}`,
            type: 'TRANSFER_RECEIVED',
          },
        ],
      });

      return transaction;
    });
  }

  /**
   * Executes an Administrative Deposit/Credit to a target user
   */
  async executeAdminCredit(params: {
    adminId: string;
    adminEmail: string;
    userId: string;
    asset: string;
    amountStr: string;
    reason: string;
  }) {
    const { adminId, adminEmail, userId, asset, amountStr, reason } = params;
    const amount = new Decimal(amountStr);

    if (amount.lessThanOrEqualTo(0)) {
      throw new Error('Credit amount must be greater than zero.');
    }

    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
      });

      if (!user || !user.wallet) {
        throw new Error('Target user or wallet not found.');
      }

      let userAccount = await tx.account.findUnique({
        where: { walletId_asset: { walletId: user.wallet.id, asset } },
      });
      if (!userAccount) {
        userAccount = await tx.account.create({
          data: { walletId: user.wallet.id, asset, type: 'ASSET_HOLDING' },
        });
      }

      // Create Transaction
      const transaction = await tx.ledgerTransaction.create({
        data: {
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
          recipientId: user.id,
          recipientWalletId: user.wallet.walletId,
          asset,
          amount: amount.toFixed(18),
          reason,
          metadata: { adminId, adminEmail },
        },
      });

      // Create CREDIT entry for user
      await tx.ledgerEntry.create({
        data: {
          transactionId: transaction.id,
          accountId: userAccount.id,
          userId: user.id,
          entryType: EntryType.CREDIT,
          asset,
          amount: amount.toFixed(18),
        },
      });

      // Immutable Audit Log
      await tx.auditLog.create({
        data: {
          adminId,
          adminEmail,
          action: 'ADMIN_CREDIT',
          targetType: 'USER_WALLET',
          targetId: user.id,
          reason,
          newState: { asset, amount: amount.toString(), walletId: user.wallet.walletId },
        },
      });

      // Notification
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Wallet Credited',
          message: `Your wallet was credited with ${amount.toFixed(4)} ${asset} by system administrator.`,
          type: 'ADMIN_CREDIT',
        },
      });

      return transaction;
    });
  }

  /**
   * Executes an Administrative Reversal of a completed transfer by creating a compensating transaction
   */
  async executeAdminReversal(params: {
    adminId: string;
    adminEmail: string;
    transactionId: string;
    reason: string;
  }) {
    const { adminId, adminEmail, transactionId, reason } = params;

    return await this.prisma.$transaction(async (tx) => {
      const originalTx = await tx.ledgerTransaction.findUnique({
        where: { id: transactionId },
        include: { entries: true },
      });

      if (!originalTx) {
        throw new Error('Original transaction not found.');
      }
      if (originalTx.status === TransactionStatus.REVERSED) {
        throw new Error('This transaction has already been reversed.');
      }
      if (originalTx.status !== TransactionStatus.COMPLETED) {
        throw new Error('Only COMPLETED transactions can be reversed.');
      }
      if (!originalTx.senderId || !originalTx.recipientId) {
        throw new Error('Transaction lacks sender or recipient details for reversal.');
      }

      const amount = new Decimal(originalTx.amount.toString());
      const asset = originalTx.asset;

      // Find wallets/accounts
      const senderWallet = await tx.wallet.findUnique({ where: { userId: originalTx.senderId } });
      const recipientWallet = await tx.wallet.findUnique({ where: { userId: originalTx.recipientId } });

      if (!senderWallet || !recipientWallet) {
        throw new Error('Wallets not found for reversal.');
      }

      const senderAccount = await tx.account.findUnique({
        where: { walletId_asset: { walletId: senderWallet.id, asset } },
      });
      const recipientAccount = await tx.account.findUnique({
        where: { walletId_asset: { walletId: recipientWallet.id, asset } },
      });

      if (!senderAccount || !recipientAccount) {
        throw new Error('Accounts not found for reversal.');
      }

      // Mark original transaction as REVERSED
      await tx.ledgerTransaction.update({
        where: { id: originalTx.id },
        data: { status: TransactionStatus.REVERSED },
      });

      // Create Compensating Reversal Transaction
      const reversalTx = await tx.ledgerTransaction.create({
        data: {
          type: TransactionType.REVERSAL,
          status: TransactionStatus.COMPLETED,
          senderId: originalTx.recipientId,
          senderWalletId: originalTx.recipientWalletId,
          recipientId: originalTx.senderId,
          recipientWalletId: originalTx.senderWalletId,
          asset,
          amount: amount.toFixed(18),
          reason,
          reversalOfId: originalTx.id,
          metadata: { reversedByAdminId: adminId, originalTxId: originalTx.id },
        },
      });

      // Compensating Entries: DEBIT former recipient, CREDIT former sender
      await tx.ledgerEntry.createMany({
        data: [
          {
            transactionId: reversalTx.id,
            accountId: recipientAccount.id,
            userId: originalTx.recipientId,
            entryType: EntryType.DEBIT,
            asset,
            amount: amount.toFixed(18),
          },
          {
            transactionId: reversalTx.id,
            accountId: senderAccount.id,
            userId: originalTx.senderId,
            entryType: EntryType.CREDIT,
            asset,
            amount: amount.toFixed(18),
          },
        ],
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          adminId,
          adminEmail,
          action: 'ADMIN_REVERSAL',
          targetType: 'TRANSACTION',
          targetId: originalTx.id,
          reason,
          newState: { reversalTxId: reversalTx.id },
        },
      });

      // Notifications
      await tx.notification.createMany({
        data: [
          {
            userId: originalTx.senderId,
            title: 'Transaction Reversed (Funds Restored)',
            message: `Transaction ${originalTx.id.slice(0, 8)} was reversed. ${amount.toFixed(4)} ${asset} restored to your account.`,
            type: 'TRANSACTION_REVERSED',
          },
          {
            userId: originalTx.recipientId,
            title: 'Transaction Reversed',
            message: `Transaction ${originalTx.id.slice(0, 8)} was reversed by administrator.`,
            type: 'TRANSACTION_REVERSED',
          },
        ],
      });

      return reversalTx;
    });
  }
}
