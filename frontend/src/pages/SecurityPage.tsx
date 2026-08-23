import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { GlassCard } from '../components/GlassCard';
import { Shield, Lock, Key, Server } from 'lucide-react';

export const SecurityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
      <Navbar />

      <div className="pt-36 pb-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="font-serif text-5xl md:text-7xl text-white">Institutional Security</h1>
          <p className="mt-6 text-lg text-neutral-400 font-sans">
            Built with strict double-entry ledger invariants, row locking, bcrypt password hashing, and role-based admin controls.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <GlassCard variant="glowing" className="p-8">
            <Lock className="w-8 h-8 text-white mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Double-Entry Accounting Invariant</h3>
            <p className="text-sm text-neutral-400">
              `sum(credit) - sum(debit) = 0`. Direct balance column mutations are forbidden by platform architecture.
            </p>
          </GlassCard>

          <GlassCard variant="glowing" className="p-8">
            <Key className="w-8 h-8 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Strict Idempotency Protection</h3>
            <p className="text-sm text-neutral-400">
              `Idempotency-Key` request headers prevent duplicate payment processing even during network retries.
            </p>
          </GlassCard>

          <GlassCard variant="glowing" className="p-8">
            <Server className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Separated Admin Control Center</h3>
            <p className="text-sm text-neutral-400">
              Privileged administrative endpoints require separate RBAC JWT tokens and record immutable audit logs.
            </p>
          </GlassCard>

          <GlassCard variant="glowing" className="p-8">
            <Shield className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Account & Wallet Freezing</h3>
            <p className="text-sm text-neutral-400">
              Instant operational freeze controls to lock suspicious activity while preserving ledger auditability.
            </p>
          </GlassCard>
        </div>
      </div>

      <Footer />
    </div>
  );
};
