import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
    walletId: string;
    accountStatus: string;
    isFrozen: boolean;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'cryptosp_production_jwt_secret_key_2026_super_secure_998877665544332211';

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication token is missing or invalid' },
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User account no longer exists' },
      });
    }

    if (user.accountStatus === 'SUSPENDED' || user.accountStatus === 'CLOSED') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended by administration.' },
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      walletId: user.wallet.walletId,
      accountStatus: user.accountStatus,
      isFrozen: user.isFrozen || user.wallet.isFrozen,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token verification failed' },
    });
  }
};

export const authorizeAdmin = (roles: string[] = []) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const isUserAdmin = req.user.role !== 'USER';
    if (!isUserAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Privileged admin access required' },
      });
    }

    if (roles.length > 0 && !roles.includes(req.user.role) && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'ROLE_FORBIDDEN', message: `Required role permissions: ${roles.join(', ')}` },
      });
    }

    next();
  };
};
