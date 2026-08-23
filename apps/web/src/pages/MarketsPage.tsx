import React, { useState, useEffect } from 'react';
import { GlassCard, MarketTicker } from '@cryptosp/ui';
import { Navbar } from '../components/Navbar';
import { Flame, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

export const MarketsPage: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/markets');
      const json = await res.json();
      if (json.success) {
        setAssets(json.data.assets);
        setIsLive(json.data.isLive);
      }
    } catch (err) {
      console.error('Failed to fetch markets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  return (
    <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
      <Navbar />

      <div className="pt-28 pb-20 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-5xl text-white">
              Live Cryptocurrency Markets
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Public market data feed & Phoenix Coin internal reference rates
            </p>
          </div>

          <button
            onClick={fetchMarkets}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white transition-all self-start md:self-auto"
            title="Refresh Prices"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {!isLive && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-mono">
            Market data temporarily unavailable from primary provider. Using cached rates.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => {
            const isPositive = asset.change24h >= 0;
            return (
              <GlassCard key={asset.symbol} variant={asset.isInternal ? 'glowing' : 'default'} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      asset.isInternal ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/5 text-white border border-white/10'
                    }`}>
                      {asset.isInternal ? <Flame className="w-5 h-5" /> : asset.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white font-mono">{asset.name}</h4>
                      <p className="text-xs text-neutral-400 font-mono">{asset.symbol}</p>
                    </div>
                  </div>

                  {asset.isInternal ? (
                    <span className="px-2 py-0.5 text-xs rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                      $10 Reference
                    </span>
                  ) : (
                    <span className={`px-2 py-0.5 text-xs rounded font-mono font-medium flex items-center ${
                      isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </span>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-baseline justify-between">
                  <span className="text-xs font-mono text-neutral-400">Price (USD)</span>
                  <span className="text-2xl font-mono font-bold text-white">
                    ${asset.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
