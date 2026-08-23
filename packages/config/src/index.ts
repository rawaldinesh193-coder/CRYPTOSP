export const PLATFORM_NAME = 'CRYPTOSP';
export const PHOENIX_COIN_SYMBOL = 'PHX';
export const PHOENIX_COIN_NAME = 'Phoenix Coin';
export const DEFAULT_PHOENIX_COIN_PRICE_USD = 10.0;

export const SUPPORTED_ASSETS = [
  { symbol: 'PHX', name: 'Phoenix Coin', isInternal: true, decimals: 4, icon: 'Flame' },
  { symbol: 'BTC', name: 'Bitcoin', isInternal: false, decimals: 8, icon: 'Coins' },
  { symbol: 'ETH', name: 'Ethereum', isInternal: false, decimals: 8, icon: 'Gem' },
  { symbol: 'USDT', name: 'Tether USD', isInternal: false, decimals: 2, icon: 'DollarSign' },
  { symbol: 'BNB', name: 'BNB', isInternal: false, decimals: 8, icon: 'Boxes' },
  { symbol: 'SOL', name: 'Solana', isInternal: false, decimals: 8, icon: 'Zap' },
  { symbol: 'XRP', name: 'XRP', isInternal: false, decimals: 6, icon: 'Activity' },
  { symbol: 'ADA', name: 'Cardano', isInternal: false, decimals: 6, icon: 'Layers' },
  { symbol: 'DOGE', name: 'Dogecoin', isInternal: false, decimals: 8, icon: 'Smile' },
] as const;

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  FINANCE_ADMIN: 'FINANCE_ADMIN',
  OPERATIONS_ADMIN: 'OPERATIONS_ADMIN',
  SUPPORT_ADMIN: 'SUPPORT_ADMIN',
  AUDITOR: 'AUDITOR',
} as const;

export const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  RESTRICTED: 'RESTRICTED',
  SUSPENDED: 'SUSPENDED',
  CLOSED: 'CLOSED',
} as const;

export const TRANSACTION_STATUS = {
  INITIATED: 'INITIATED',
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REVERSED: 'REVERSED',
} as const;

export const TRANSACTION_TYPES = {
  TRANSFER: 'TRANSFER',
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  ADJUSTMENT: 'ADJUSTMENT',
  REVERSAL: 'REVERSAL',
} as const;

export const API_ENDPOINTS = {
  COINGECKO_SIMPLE_PRICE: 'https://api.coingecko.com/api/v3/simple/price',
};
