import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Shield, ArrowUpRight } from 'lucide-react';
import { GlassButton } from './GlassButton';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-black border-t border-white/10 overflow-hidden pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="relative rounded-3xl p-12 md:p-20 bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/15 backdrop-blur-2xl text-center">
          <h2 className="font-serif text-4xl md:text-6xl text-white font-normal tracking-tight max-w-3xl mx-auto leading-tight">
            Move value without friction.
          </h2>
          <p className="mt-6 text-lg text-neutral-400 font-sans max-w-2xl mx-auto">
            A modern digital wallet built for fast, transparent, and secure value transfer.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <GlassButton variant="primary" size="lg">
                Open Your Wallet
              </GlassButton>
            </Link>
            <Link to="/phoenix">
              <GlassButton variant="secondary" size="lg" className="flex items-center space-x-2">
                <span>Explore Phoenix</span>
                <ArrowUpRight className="w-4 h-4" />
              </GlassButton>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/10 text-sm">
        <div className="md:col-span-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif text-xl tracking-wider text-white font-bold">CRYPTOSP</span>
          </div>
          <p className="mt-4 text-neutral-400 max-w-sm text-sm leading-relaxed">
            Cryptosp is a next-generation digital wallet and internal payment platform. Phoenix Coin ($10 reference value) powers instant zero-friction internal transfers with double-entry database auditability.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white font-mono uppercase text-xs tracking-wider mb-4">Platform</h4>
          <ul className="space-y-3 text-neutral-400">
            <li><Link to="/markets" className="hover:text-white transition-colors">Crypto Markets</Link></li>
            <li><Link to="/phoenix" className="hover:text-white transition-colors">Phoenix Coin ($10)</Link></li>
            <li><Link to="/security" className="hover:text-white transition-colors">Ledger Architecture</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white font-mono uppercase text-xs tracking-wider mb-4">Legal & Risk</h4>
          <ul className="space-y-3 text-neutral-400">
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/risk" className="hover:text-white transition-colors">Risk Disclosure</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Compliance & Support</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white font-mono uppercase text-xs tracking-wider mb-4">Security</h4>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-medium">
              <Shield className="w-4 h-4" />
              <span>PostgreSQL Double-Entry</span>
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              Immutable ledger balancing, row-level locking, and strict idempotency key protection.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 font-mono">
        <p>© 2026 CRYPTOSP Platform. All rights reserved.</p>
        <p>1 PHX = $10.00 USD (Internal Reference Valuation)</p>
      </div>
    </footer>
  );
};
