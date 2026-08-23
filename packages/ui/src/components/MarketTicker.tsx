import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface MarketAsset {
  symbol: string;
  name: string;
  priceUsd: number;
  change24h: number;
  isInternal?: boolean;
}

export interface MarketTickerProps {
  assets: MarketAsset[];
}

export const MarketTicker: React.FC<MarketTickerProps> = ({ assets }) => {
  return (
    <div className="w-full overflow-hidden bg-black/80 border-y border-white/10 py-3">
      <div className="flex items-center space-x-8 animate-marquee whitespace-nowrap px-4">
        {assets.map((asset) => {
          const isPositive = asset.change24h >= 0;
          return (
            <div key={asset.symbol} className="inline-flex items-center space-x-3 text-sm">
              <span className="font-semibold text-white font-mono">{asset.symbol}</span>
              <span className="text-neutral-300 font-mono">${asset.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span className={`inline-flex items-center text-xs font-mono font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                {isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%
              </span>
              {asset.isInternal && (
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest font-mono">
                  Internal
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
