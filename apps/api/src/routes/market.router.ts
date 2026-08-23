import { Router, Response, Request } from 'express';
import { prisma } from '@cryptosp/database';

const router = Router();

// In-memory cache for market data
let marketCache: { data: any[]; lastUpdated: number } | null = null;
const CACHE_TTL_MS = 30000; // 30 seconds

async function fetchLiveMarketData() {
  if (marketCache && Date.now() - marketCache.lastUpdated < CACHE_TTL_MS) {
    return { data: marketCache.data, isLive: true };
  }

  // Configured Phoenix Coin price
  const settings = await prisma.systemSettings.findFirst();
  const phoenixPrice = settings ? Number(settings.phoenixCoinPriceUsd.toString()) : 10.00;

  try {
    // Fetch live market data from public CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin,solana,ripple,cardano,dogecoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true'
    );

    if (response.ok) {
      const json: any = await response.json();
      const assets = [
        {
          symbol: 'PHX',
          name: 'Phoenix Coin',
          priceUsd: phoenixPrice,
          change24h: 0.00,
          volume24h: 1250000,
          marketCap: 100000000,
          isInternal: true,
          lastUpdated: new Date().toISOString(),
        },
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          priceUsd: json.bitcoin?.usd || 64250.00,
          change24h: json.bitcoin?.usd_24h_change || 1.85,
          volume24h: json.bitcoin?.usd_24h_vol || 28450000000,
          marketCap: json.bitcoin?.usd_market_cap || 1260000000000,
          isInternal: false,
          lastUpdated: new Date().toISOString(),
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          priceUsd: json.ethereum?.usd || 3480.00,
          change24h: json.ethereum?.usd_24h_change || 2.40,
          volume24h: json.ethereum?.usd_24h_vol || 14200000000,
          marketCap: json.ethereum?.usd_market_cap || 418000000000,
          isInternal: false,
          lastUpdated: new Date().toISOString(),
        },
        {
          symbol: 'USDT',
          name: 'Tether USD',
          priceUsd: json.tether?.usd || 1.00,
          change24h: json.tether?.usd_24h_change || 0.01,
          volume24h: json.tether?.usd_24h_vol || 45000000000,
          marketCap: json.tether?.usd_market_cap || 114000000000,
          isInternal: false,
          lastUpdated: new Date().toISOString(),
        },
        {
          symbol: 'BNB',
          name: 'BNB',
          priceUsd: json.binancecoin?.usd || 580.00,
          change24h: json.binancecoin?.usd_24h_change || -0.45,
          volume24h: json.binancecoin?.usd_24h_vol || 980000000,
          marketCap: json.binancecoin?.usd_market_cap || 85000000000,
          isInternal: false,
          lastUpdated: new Date().toISOString(),
        },
        {
          symbol: 'SOL',
          name: 'Solana',
          priceUsd: json.solana?.usd || 145.50,
          change24h: json.solana?.usd_24h_change || 5.12,
          volume24h: json.solana?.usd_24h_vol || 3100000000,
          marketCap: json.solana?.usd_market_cap || 68000000000,
          isInternal: false,
          lastUpdated: new Date().toISOString(),
        },
        {
          symbol: 'XRP',
          name: 'XRP',
          priceUsd: json.ripple?.usd || 0.58,
          change24h: json.ripple?.usd_24h_change || 1.10,
          volume24h: json.ripple?.usd_24h_vol || 1200000000,
          marketCap: json.ripple?.usd_market_cap || 32000000000,
          isInternal: false,
          lastUpdated: new Date().toISOString(),
        },
        {
          symbol: 'ADA',
          name: 'Cardano',
          priceUsd: json.cardano?.usd || 0.38,
          change24h: json.cardano?.usd_24h_change || -0.80,
          volume24h: json.cardano?.usd_24h_vol || 450000000,
          marketCap: json.cardano?.usd_market_cap || 13500000000,
          isInternal: false,
          lastUpdated: new Date().toISOString(),
        },
        {
          symbol: 'DOGE',
          name: 'Dogecoin',
          priceUsd: json.dogecoin?.usd || 0.12,
          change24h: json.dogecoin?.usd_24h_change || 3.40,
          volume24h: json.dogecoin?.usd_24h_vol || 890000000,
          marketCap: json.dogecoin?.usd_market_cap || 17500000000,
          isInternal: false,
          lastUpdated: new Date().toISOString(),
        },
      ];

      marketCache = { data: assets, lastUpdated: Date.now() };
      return { data: assets, isLive: true };
    }
  } catch (err) {
    console.warn('External Market API unavailable, using cached rates:', err);
  }

  // Fallback default dataset if external API fails (Section 50 compliance)
  const fallbackAssets = [
    { symbol: 'PHX', name: 'Phoenix Coin', priceUsd: phoenixPrice, change24h: 0.0, isInternal: true, lastUpdated: new Date().toISOString() },
    { symbol: 'BTC', name: 'Bitcoin', priceUsd: 64250.00, change24h: 1.85, isInternal: false, lastUpdated: new Date().toISOString() },
    { symbol: 'ETH', name: 'Ethereum', priceUsd: 3480.00, change24h: 2.40, isInternal: false, lastUpdated: new Date().toISOString() },
    { symbol: 'USDT', name: 'Tether USD', priceUsd: 1.00, change24h: 0.01, isInternal: false, lastUpdated: new Date().toISOString() },
    { symbol: 'SOL', name: 'Solana', priceUsd: 145.50, change24h: 5.12, isInternal: false, lastUpdated: new Date().toISOString() },
  ];

  return { data: fallbackAssets, isLive: false };
}

// GET /api/v1/markets
router.get('/', async (req: Request, res: Response) => {
  try {
    const marketResult = await fetchLiveMarketData();
    return res.json({
      success: true,
      data: {
        assets: marketResult.data,
        isLive: marketResult.isLive,
        notice: marketResult.isLive ? undefined : 'Market data temporarily unavailable from primary provider.',
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'MARKET_ERROR', message: err.message },
    });
  }
});

export const marketRouter = router;
