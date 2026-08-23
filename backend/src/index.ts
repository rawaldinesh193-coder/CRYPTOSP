import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { authRouter } from './routes/auth.router';
import { walletRouter } from './routes/wallet.router';
import { transactionRouter } from './routes/transaction.router';
import { marketRouter } from './routes/market.router';
import { notificationRouter } from './routes/notification.router';
import { adminRouter } from './routes/admin.router';

// Load environment variables from local and root .env paths
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Welcome & Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'CRYPTOSP API Engine',
    status: 'ONLINE',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      ready: '/ready',
      auth: '/api/v1/auth',
      wallets: '/api/v1/wallets',
      transfers: '/api/v1/transfers',
      transactions: '/api/v1/transactions',
      markets: '/api/v1/markets',
      admin: '/api/v1/admin',
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CRYPTOSP API', timestamp: new Date().toISOString() });
});

app.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ready: true, database: 'CONNECTED', timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ ready: false, database: 'DISCONNECTED', error: err.message });
  }
});

// Versioned API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/wallets', walletRouter);
app.use('/api/v1/transfers', walletRouter);
app.use('/api/v1/payments', walletRouter);
app.use('/api/v1/transactions', transactionRouter);
app.use('/api/v1/markets', marketRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/admin', adminRouter);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.url} not found` },
  });
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 CRYPTOSP API Server running on http://${HOST}:${PORT}`);
});

export default app;
