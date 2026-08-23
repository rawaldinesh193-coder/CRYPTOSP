import { z } from 'zod';

export const RegisterSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const TransferSchema = z.object({
  recipientWalletId: z.string().regex(/^CSP-[A-Z0-9]{12}$/, 'Invalid Cryptosp Wallet ID format (e.g. CSP-XXXXXXXXXXXX)'),
  asset: z.string().min(2, 'Asset symbol is required'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  note: z.string().max(200).optional(),
  idempotencyKey: z.string().optional(),
});

export const PaymentRequestSchema = z.object({
  asset: z.string().default('PHX'),
  amount: z.string().optional(),
  reference: z.string().optional(),
});

export const AdminCreditSchema = z.object({
  userId: z.string().uuid('Invalid User UUID'),
  asset: z.string().min(2, 'Asset symbol required'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  reason: z.string().min(5, 'Mandatory reason of at least 5 characters required for administrative credit'),
});

export const AdminReversalSchema = z.object({
  transactionId: z.string().uuid('Invalid Transaction UUID'),
  reason: z.string().min(5, 'Mandatory reason required for transaction reversal'),
});

export const AdminUpdateSettingsSchema = z.object({
  platformName: z.string().optional(),
  maintenanceMode: z.boolean().optional(),
  phoenixCoinPriceUsd: z.number().positive().optional(),
  minTransferAmount: z.number().nonnegative().optional(),
  maxTransferAmount: z.number().positive().optional(),
  platformFeePercentage: z.number().nonnegative().optional(),
  mfaRequiredForAdmin: z.boolean().optional(),
});

export const AdminUserActionSchema = z.object({
  userId: z.string().uuid('Invalid User UUID'),
  action: z.enum(['FREEZE_WALLET', 'UNFREEZE_WALLET', 'SUSPEND_USER', 'UNSUSPEND_USER', 'RESTRICT_USER']),
  reason: z.string().min(3, 'Reason required for user action'),
});
