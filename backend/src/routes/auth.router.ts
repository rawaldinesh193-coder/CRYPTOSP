import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'cryptosp_production_jwt_secret_key_2026_super_secure_998877665544332211';

const RegisterSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function generateWalletId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CSP-${code}`;
}

router.post('/register', async (req, res) => {
  try {
    const parse = RegisterSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parse.error.errors[0].message },
      });
    }

    const { username, email, password, fullName, phone } = parse.data;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'Username or Email is already registered' },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let walletId = generateWalletId();
    let isUnique = false;
    while (!isUnique) {
      const existing = await prisma.wallet.findUnique({ where: { walletId } });
      if (!existing) isUnique = true;
      else walletId = generateWalletId();
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          email,
          passwordHash,
          fullName,
          phone,
          role: 'USER',
          accountStatus: 'ACTIVE',
          verificationStatus: 'VERIFIED',
        },
      });

      await tx.userProfile.create({
        data: {
          userId: user.id,
          lastLoginIp: req.ip,
          lastLoginAt: new Date(),
        },
      });

      const wallet = await tx.wallet.create({
        data: {
          userId: user.id,
          walletId,
        },
      });

      const assets = ['PHX', 'BTC', 'ETH', 'USDT', 'SOL'];
      for (const asset of assets) {
        await tx.account.create({
          data: { walletId: wallet.id, asset, type: 'ASSET_HOLDING' },
        });
      }

      return { user, wallet };
    });

    const token = jwt.sign(
      { userId: result.user.id, email: result.user.email, role: result.user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          fullName: result.user.fullName,
          walletId: result.wallet.walletId,
          role: result.user.role,
          accountStatus: result.user.accountStatus,
          verificationStatus: result.user.verificationStatus,
          createdAt: result.user.createdAt,
        },
      },
    });
  } catch (err: any) {
    console.error('❌ Registration Exception:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message || 'Internal registration failure' },
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const parse = LoginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parse.error.errors[0].message },
      });
    }

    const { email, password } = parse.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true, userProfile: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    if (user.accountStatus === 'SUSPENDED' || user.accountStatus === 'CLOSED') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended by administration.' },
      });
    }

    if (user.userProfile) {
      await prisma.userProfile.update({
        where: { id: user.userProfile.id },
        data: { lastLoginIp: req.ip, lastLoginAt: new Date() },
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          walletId: user.wallet?.walletId,
          role: user.role,
          accountStatus: user.accountStatus,
          verificationStatus: user.verificationStatus,
          isFrozen: user.isFrozen || user.wallet?.isFrozen,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (err: any) {
    console.error('❌ Login Exception:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message || 'Internal login failure' },
    });
  }
});

router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { wallet: true, userProfile: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        walletId: user.wallet?.walletId,
        role: user.role,
        accountStatus: user.accountStatus,
        verificationStatus: user.verificationStatus,
        isFrozen: user.isFrozen || user.wallet?.isFrozen,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err: any) {
    console.error('❌ Auth /me Exception:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

export const authRouter = router;
