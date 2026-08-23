export type AccountStatus = 'ACTIVE' | 'RESTRICTED' | 'SUSPENDED' | 'CLOSED';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type AdminRole = 'SUPER_ADMIN' | 'FINANCE_ADMIN' | 'OPERATIONS_ADMIN' | 'SUPPORT_ADMIN' | 'AUDITOR';

export interface UserDTO {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  profileImage?: string;
  walletId: string;
  accountStatus: AccountStatus;
  verificationStatus: VerificationStatus;
  isFrozen: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletDTO {
  id: string;
  userId: string;
  walletId: string; // e.g. CSP-XXXXXXXXXXXX
  isFrozen: boolean;
  balances: Record<string, {
    available: string;
    pending: string;
    total: string;
    usdValue: string;
  }>;
  totalPortfolioUsd: string;
  createdAt: string;
}

export type TransactionStatus = 'INITIATED' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REVERSED';
export type TransactionType = 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'ADJUSTMENT' | 'REVERSAL';

export interface LedgerEntryDTO {
  id: string;
  transactionId: string;
  accountId: string;
  userId: string;
  entryType: 'DEBIT' | 'CREDIT';
  asset: string;
  amount: string;
  createdAt: string;
}

export interface TransactionDTO {
  id: string;
  idempotencyKey?: string;
  type: TransactionType;
  status: TransactionStatus;
  senderId?: string;
  senderWalletId?: string;
  senderName?: string;
  recipientId?: string;
  recipientWalletId?: string;
  recipientName?: string;
  asset: string;
  amount: string;
  fee: string;
  reference?: string;
  note?: string;
  reason?: string;
  reversalOfId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  entries?: LedgerEntryDTO[];
}

export interface QRPaymentPayload {
  walletId: string;
  recipientName?: string;
  asset?: string;
  amount?: string;
  reference?: string;
}

export interface MarketPriceDTO {
  symbol: string;
  name: string;
  priceUsd: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: string;
}

export interface AuditLogDTO {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  oldState?: Record<string, any>;
  newState?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface SystemSettingsDTO {
  platformName: string;
  maintenanceMode: boolean;
  phoenixCoinPriceUsd: number;
  minTransferAmount: number;
  maxTransferAmount: number;
  platformFeePercentage: number;
  mfaRequiredForAdmin: boolean;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  requestId?: string;
}
