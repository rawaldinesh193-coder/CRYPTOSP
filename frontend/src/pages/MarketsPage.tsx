import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { GlassCard } from '../components/GlassCard';
import { Flame, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

export const MarketsPage: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/markets');
      const json = await res.json();
      if (json.success) setAssets(json.data.assets);
    } catch (err) {
      console.error('Failed to load market data:', err);
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

      <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-white">Live Cryptocurrency Markets</h1>
            <p className="text-sm text-neutral-400 font-mono mt-2">Real-time asset prices & Phoenix Coin internal reference valuation</p>
          </div>

          <button
            onClick={fetchMarkets}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white transition-all self-start md:self-auto flex items-center space-x-2 text-xs font-mono"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Ticker</span>
          </button>
        </div>

        <GlassCard className="overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-mono text-neutral-400 uppercase tracking-wider bg-white/[0.02]">
                <th className="p-4">Asset</th>
                <th className="p-4">Price (USD)</th>
                <th className="p-4">24h Change</th>
                <th className="p-4">Market Type</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-sans">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-neutral-500 font-mono">Loading live market prices...</td></tr>
              ) : (
                assets.map((asset) => {
                  const isPositive = asset.change24h >= 0;
                  return (
                    <tr key={asset.symbol} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 flex items-center space-x-3">
                        {asset.isInternal ? (
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                            <Flame className="w-4 h-4 text-amber-400" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold font-mono text-xs">
                            {asset.symbol.slice(0, 3)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white">{asset.name}</p>
                          <p className="text-xs text-neutral-400 font-mono">{asset.symbol}</p>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-white text-base">
                        ${asset.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 font-mono text-sm">
                        <span className={`inline-flex items-center ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                          {isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="p-4">
                        {asset.isInternal ? (
                          <span className="px-2.5 py-1 text-xs rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                            Internal Platform Asset
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs rounded bg-white/5 text-neutral-400 border border-white/10 font-mono">
                            Global Market
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right font-mono text-xs text-emerald-400">
                        Active
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </GlassCard>
      </div>

      <Footer />
    </div>
  );
};
