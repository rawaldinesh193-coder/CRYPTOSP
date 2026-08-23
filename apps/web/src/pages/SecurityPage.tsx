import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { GlassCard } from '@cryptosp/ui';
import { Shield, Lock, Layers, RefreshCw, Key, CheckCircle2 } from 'lucide-react';

export const SecurityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
      <Navbar />

      <div className="pt-36 pb-24 max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono uppercase tracking-widest">
            Production Security Standard
          </span>
          <h1 className="font-serif text-5xl md:text-6xl text-white mt-4">
            Security & Ledger Architecture
          </h1>
          <p className="mt-4 text-lg text-neutral-400 max-w-2xl mx-auto">
            Financial-grade data protection, atomic row locks, and zero-trust authorization.
          </p>
        </div>

        <div className="space-y-8">
          <GlassCard className="p-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-emerald-400">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-serif">1. PostgreSQL Double-Entry Ledger</h3>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  Balances are strictly derived from double-entry SQL queries (`SUM(CREDIT) - SUM(DEBIT)`). Direct database column updates on balances are prohibited at the architecture level.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-emerald-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-serif">2. Atomic Transactions & Row Locking</h3>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  All money movements execute inside PostgreSQL `BEGIN ... COMMIT` blocks with `SELECT FOR UPDATE` row locks to prevent concurrent double-spending race conditions.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-emerald-400">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-serif">3. Strict RBAC & Audit System</h3>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  Admin operations (credits, reversals, suspensions) require privileged authentication, explicit reasons, and create immutable rows in the system audit table.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <Footer />
    </div>
  );
};
