import { PrismaClient } from '@prisma/client';
import { LedgerService } from './ledger.service';

export const prisma = new PrismaClient();
export const ledgerService = new LedgerService(prisma);

export * from '@prisma/client';
export * from './ledger.service';
