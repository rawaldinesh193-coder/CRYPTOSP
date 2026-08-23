import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { GlassCard } from '@cryptosp/ui';
import { Flame, Shield, CheckCircle2 } from 'lucide-react';

export const PhoenixPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
      <Navbar />

      <div className="pt-36 pb-24 max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono text-amber-300">Internal Reference Valuation: $10.00 USD</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-white">
            Phoenix Coin Specification
          </h1>
          <p className="mt-4 text-lg text-neutral-400 max-w-2xl mx-auto">
            Technical whitepaper and platform architecture for Cryptosp's native digital asset.
          </p>
        </div>

        <GlassCard variant="glowing" className="p-8 md:p-12 space-y-8 font-sans">
          <div>
            <h3 className="text-2xl font-serif text-white font-bold mb-3">1. Executive Overview</h3>
            <p className="text-neutral-300 leading-relaxed text-sm">
              Phoenix Coin (PHX) is the internal digital accounting unit designed specifically for the Cryptosp platform. Unlike speculative publicly traded cryptocurrencies, Phoenix Coin maintains an administrator-configurable reference value ($10.00 USD) to facilitate predictable zero-fee settlements across platform participants.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-serif text-white font-bold mb-3">2. Financial Ledger Mechanics</h3>
            <p className="text-neutral-300 leading-relaxed text-sm">
              Every PHX movement generates immutable PostgreSQL double-entry rows. When User A transfers 10 PHX to User B, the transaction engine creates a DEBIT entry for User A (-10 PHX) and a CREDIT entry for User B (+10 PHX), ensuring the system invariant `sum(credit) - sum(debit) = 0` holds at all times.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-serif text-white font-bold mb-3">3. Configurable Reference Rate</h3>
            <p className="text-neutral-300 leading-relaxed text-sm">
              The $10 reference valuation is managed strictly via protected administrative workflows. Any adjustment to the valuation creates an entry in the immutable `AssetPrice` database audit log.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <h4 className="text-sm font-mono font-bold text-emerald-400 uppercase tracking-wider">Key Specifications</h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono text-neutral-300">
              <div>Asset Code: <span className="text-white">PHX</span></div>
              <div>Initial Valuation: <span className="text-white">$10.00 USD</span></div>
              <div>Settlement Speed: <span className="text-emerald-400">&lt; 100ms</span></div>
              <div>Precision: <span className="text-white">18 Decimals</span></div>
            </div>
          </div>
        </GlassCard>
      </div>

      <Footer />
    </div>
  );
};
