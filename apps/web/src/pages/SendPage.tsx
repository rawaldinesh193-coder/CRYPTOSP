import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard, GlassButton } from '@cryptosp/ui';
import { Navbar } from '../components/Navbar';
import { Send, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const SendPage: React.FC = () => {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [recipientWalletId, setRecipientWalletId] = useState(searchParams.get('walletId') || '');
  const [asset, setAsset] = useState(searchParams.get('asset') || 'PHX');
  const [amount, setAmount] = useState(searchParams.get('amount') || '');
  const [note, setNote] = useState('');
  
  const [recipientInfo, setRecipientInfo] = useState<any>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const [step, setStep] = useState<'input' | 'review' | 'success'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionResult, setTransactionResult] = useState<any>(null);

  // Auto-resolve recipient when wallet ID is 16 chars (CSP-XXXXXXXXXXXX)
  const handleWalletIdChange = async (val: string) => {
    const upper = val.toUpperCase().trim();
    setRecipientWalletId(upper);
    setRecipientInfo(null);
    setResolveError(null);

    if (upper.length === 16 && upper.startsWith('CSP-')) {
      setResolving(true);
      try {
        const res = await fetch(`/api/v1/payments/resolve/${upper}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) {
          setRecipientInfo(json.data);
        } else {
          setResolveError(json.error?.message || 'Recipient not found');
        }
      } catch (err) {
        setResolveError('Failed to resolve wallet ID');
      } finally {
        setResolving(false);
      }
    }
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!recipientWalletId || !amount || Number(amount) <= 0) {
      setError('Please fill in valid recipient wallet ID and positive amount.');
      return;
    }
    setStep('review');
  };

  const handleConfirmTransfer = async () => {
    setLoading(true);
    setError(null);

    // Generate unique idempotency key for this transfer
    const idempotencyKey = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const res = await fetch('/api/v1/transfers/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          recipientWalletId,
          asset,
          amount,
          note: note || undefined,
          idempotencyKey,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setTransactionResult(json.data);
        setStep('success');
        refreshUser();
      } else {
        setError(json.error?.message || 'Transfer failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
      <Navbar />

      <div className="pt-28 pb-20 max-w-xl mx-auto px-6">
        <h1 className="font-serif text-3xl md:text-4xl text-white text-center mb-2">
          Send Digital Assets
        </h1>
        <p className="text-sm text-neutral-400 text-center mb-8 font-sans">
          Instant settlement via Cryptosp double-entry accounting engine
        </p>

        <GlassCard variant="glowing" className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'input' && (
            <form onSubmit={handleReview} className="space-y-6">
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
                  Recipient Cryptosp Wallet ID
                </label>
                <input
                  type="text"
                  required
                  value={recipientWalletId}
                  onChange={(e) => handleWalletIdChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-all uppercase"
                  placeholder="CSP-XXXXXXXXXXXX"
                />
                {resolving && <p className="text-xs text-neutral-400 font-mono mt-1">Resolving wallet owner...</p>}
                {recipientInfo && (
                  <div className="mt-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono flex items-center justify-between">
                    <span>Recipient Verified: <strong>{recipientInfo.fullName}</strong> (@{recipientInfo.username})</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
                {resolveError && <p className="text-xs text-red-400 font-mono mt-1">{resolveError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
                    Asset
                  </label>
                  <select
                    value={asset}
                    onChange={(e) => setAsset(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-mono focus:outline-none focus:border-white/40 transition-all"
                  >
                    <option value="PHX" className="bg-neutral-900 text-white">Phoenix Coin (PHX)</option>
                    <option value="BTC" className="bg-neutral-900 text-white">Bitcoin (BTC)</option>
                    <option value="ETH" className="bg-neutral-900 text-white">Ethereum (ETH)</option>
                    <option value="USDT" className="bg-neutral-900 text-white">Tether USD (USDT)</option>
                    <option value="SOL" className="bg-neutral-900 text-white">Solana (SOL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
                  Optional Note / Reference
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-all font-sans"
                  placeholder="e.g. Payment for invoice #104"
                />
              </div>

              <GlassButton variant="primary" size="lg" className="w-full mt-4 flex items-center justify-center space-x-2">
                <span>Review Transfer</span>
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </form>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4">
                Confirm Transfer Details
              </h3>

              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-neutral-400">Recipient Wallet ID</span>
                  <span className="text-white font-bold">{recipientWalletId}</span>
                </div>
                {recipientInfo && (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-neutral-400">Recipient Name</span>
                    <span className="text-emerald-400">{recipientInfo.fullName}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-neutral-400">Transfer Asset</span>
                  <span className="text-amber-400 font-bold">{asset}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-neutral-400">Transfer Amount</span>
                  <span className="text-white font-bold text-base">{amount} {asset}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-neutral-400">Platform Network Fee</span>
                  <span className="text-emerald-400">0.00 {asset}</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <GlassButton variant="outline" size="lg" className="w-1/2" onClick={() => setStep('input')}>
                  Back
                </GlassButton>
                <GlassButton variant="primary" size="lg" className="w-1/2" disabled={loading} onClick={handleConfirmTransfer}>
                  {loading ? 'Executing...' : 'Confirm & Send'}
                </GlassButton>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">Transfer Completed!</h3>
                <p className="text-sm text-neutral-400 mt-1 font-mono">
                  {amount} {asset} successfully transferred to {recipientWalletId}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono text-left space-y-2">
                <p><span className="text-neutral-500">Transaction ID:</span> {transactionResult?.id}</p>
                <p><span className="text-neutral-500">Ledger Invariant:</span> DEBIT & CREDIT balanced</p>
              </div>

              <GlassButton variant="primary" size="lg" className="w-full" onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </GlassButton>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
