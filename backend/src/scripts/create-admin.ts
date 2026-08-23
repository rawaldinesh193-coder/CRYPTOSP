import { PrismaClient, AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@cryptosp.internal';
  const password = process.argv[3] || 'AdminPass123!';
  const username = process.argv[4] || 'superadmin';
  const fullName = process.argv[5] || 'Super Administrator';

  console.log(`🚀 Provisioning CRYPTOSP Administrator account: ${email}...`);

  const passwordHash = await bcrypt.hash(password, 10);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let walletId = 'CSP-ADMIN00001';

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: AdminRole.SUPER_ADMIN,
      accountStatus: 'ACTIVE',
      verificationStatus: 'VERIFIED',
    },
    create: {
      username,
      email,
      passwordHash,
      fullName,
      role: AdminRole.SUPER_ADMIN,
      accountStatus: 'ACTIVE',
      verificationStatus: 'VERIFIED',
    },
  });

  let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        walletId,
      },
    });
  }

  let profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    await prisma.userProfile.create({
      data: { userId: user.id },
    });
  }

  const assets = ['PHX', 'BTC', 'ETH', 'USDT', 'SOL'];
  for (const asset of assets) {
    const existing = await prisma.account.findUnique({
      where: { walletId_asset: { walletId: wallet.id, asset } },
    });
    if (!existing) {
      await prisma.account.create({
        data: { walletId: wallet.id, asset, type: 'ASSET_HOLDING' },
      });
    }
  }

  console.log('✅ Administrator Account Provisioned Successfully!');
  console.log('--------------------------------------------------');
  console.log(`Admin Login URL: http://localhost:3000/admin/login`);
  console.log(`Email:          ${email}`);
  console.log(`Password:       ${password}`);
  console.log(`Role:           ${user.role}`);
  console.log(`Wallet ID:      ${wallet.walletId}`);
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Failed to provision admin account:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
