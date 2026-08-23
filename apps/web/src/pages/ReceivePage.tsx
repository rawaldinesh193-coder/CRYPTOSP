import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassCard, GlassButton, WalletQR } from '@cryptosp/ui';
import { Navbar } from '../components/Navbar';
import { Copy, Check, QrCode } from 'lucide-react';

export const ReceivePage: React.FC = () => {
  const { user } = useAuth();
  const [asset, setAsset] = useState('PHX');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (user?.walletId) {
      navigator.clipboard.writeText(user.walletId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
      <Navbar />

      <div className="pt-28 pb-20 max-w-xl mx-auto px-6">
        <h1 className="font-serif text-3xl md:text-4xl text-white text-center mb-2">
          Receive Assets
        </h1>
        <p className="text-sm text-neutral-400 text-center mb-8 font-sans">
          Share your QR code or Wallet ID to receive instant settlements
        </p>

        <GlassCard variant="glowing" className="p-8 text-center">
          {/* QR Code Presentation */}
          <div className="flex justify-center mb-6">
            <WalletQR
              walletId={user?.walletId || 'CSP-000000000000'}
              asset={asset}
              amount={amount || undefined}
              reference={reference || undefined}
              size={220}
            />
          </div>

          <div className="flex items-center justify-center space-x-3 mb-8">
            <span className="font-mono text-lg font-bold text-white tracking-wider">{user?.walletId}</span>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-all flex items-center space-x-1 text-xs font-mono"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Payment Request Builder */}
          <div className="pt-6 border-t border-white/10 text-left space-y-4">
            <h4 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Create Specific Payment Request
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Asset</label>
                <select
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-sm focus:outline-none"
                >
                  <option value="PHX" className="bg-neutral-900">Phoenix Coin (PHX)</option>
                  <option value="BTC" className="bg-neutral-900">Bitcoin (BTC)</option>
                  <option value="ETH" className="bg-neutral-900">Ethereum (ETH)</option>
                  <option value="USDT" className="bg-neutral-900">Tether (USDT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Requested Amount</label>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-sm focus:outline-none placeholder-neutral-500"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1">Reference / Invoice</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none placeholder-neutral-500"
                placeholder="e.g. INV-2026-99"
              />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
