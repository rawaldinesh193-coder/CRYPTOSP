import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { Link } from 'react-router-dom';
import { Flame, ShieldCheck, Zap, Coins } from 'lucide-react';

export const PhoenixPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
      <Navbar />

      <div className="pt-36 pb-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
            <Flame className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="font-serif text-5xl md:text-7xl text-white">Phoenix Coin (PHX)</h1>
          <p className="mt-6 text-lg text-neutral-400 font-sans">
            The native internal asset of Cryptosp platform with an initial reference valuation of <strong>1 PHX = $10.00 USD</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <GlassCard variant="glowing" className="p-8">
            <Zap className="w-8 h-8 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Sub-100ms Settlement</h3>
            <p className="text-sm text-neutral-400">
              Transactions settle instantly inside the PostgreSQL double-entry ledger without waiting for public blockchain block times.
            </p>
          </GlassCard>

          <GlassCard variant="glowing" className="p-8">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Audited Valuation</h3>
            <p className="text-sm text-neutral-400">
              Reference valuation updates are tracked in immutable `AssetPrice` price history tables with admin audit logs.
            </p>
          </GlassCard>

          <GlassCard variant="glowing" className="p-8">
            <Coins className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Zero Network Fees</h3>
            <p className="text-sm text-neutral-400">
              Internal user-to-user transfers carry 0.00% network gas fees for maximum liquidity and payment efficiency.
            </p>
          </GlassCard>
        </div>

        <div className="text-center">
          <Link to="/register">
            <GlassButton variant="primary" size="lg">
              Get Started with Phoenix Coin
            </GlassButton>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};
