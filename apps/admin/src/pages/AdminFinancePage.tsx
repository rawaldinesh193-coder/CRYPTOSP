import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { GlassCard, GlassButton } from '@cryptosp/ui';
import { AdminSidebar } from '../components/AdminSidebar';
import { DollarSign, RefreshCw, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const AdminFinancePage: React.FC = () => {
  const { token } = useAdminAuth();
  const [tab, setTab] = useState<'deposit' | 'reversal' | 'transactions'>('deposit');

  // Deposit state
  const [targetUserId, setTargetUserId] = useState('');
  const [depositAsset, setDepositAsset] = useState('PHX');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositReason, setDepositReason] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositMessage, setDepositMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reversal state
  const [reversalTxId, setReversalTxId] = useState('');
  const [reversalReason, setReversalReason] = useState('');
  const [reversalLoading, setReversalLoading] = useState(false);
  const [reversalMessage, setReversalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // User search helper
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    if (!token) return;
    fetch('/api/v1/admin/users?limit=50', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((json) => { if (json.success) setUsers(json.data.users); });
  }, [token]);

  const handleAdminCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositLoading(true);
    setDepositMessage(null);

    try {
      const res = await fetch('/api/v1/admin/operations/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: targetUserId,
          asset: depositAsset,
          amount: depositAmount,
          reason: depositReason,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setDepositMessage({ type: 'success', text: `Successfully credited ${depositAmount} ${depositAsset} to target user wallet. Transaction ID: ${json.data.id}` });
        setDepositAmount('');
        setDepositReason('');
      } else {
        setDepositMessage({ type: 'error', text: json.error?.message || 'Admin credit failed' });
      }
    } catch (err: any) {
      setDepositMessage({ type: 'error', text: err.message });
    } finally {
      setDepositLoading(false);
    }
  };

  const handleAdminReversal = async (e: React.FormEvent) => {
    e.preventDefault();
    setReversalLoading(true);
    setReversalMessage(null);

    try {
      const res = await fetch('/api/v1/admin/operations/reversal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId: reversalTxId,
          reason: reversalReason,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setReversalMessage({ type: 'success', text: `Compensating reversal transaction created successfully. Reversal Tx ID: ${json.data.id}` });
        setReversalTxId('');
        setReversalReason('');
      } else {
        setReversalMessage({ type: 'error', text: json.error?.message || 'Transaction reversal failed' });
      }
    } catch (err: any) {
      setReversalMessage({ type: 'error', text: err.message });
    } finally {
      setReversalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white flex bg-liquid-mesh">
      <AdminSidebar />

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl text-white">Finance Control Center</h1>
            <p className="text-xs text-neutral-400 font-mono mt-1">Controlled administrative credits & compensating transaction reversals</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-4 mb-8 border-b border-white/10 pb-4">
          <button
            onClick={() => setTab('deposit')}
            className={`px-4 py-2 rounded-xl text-sm font-mono transition-all ${
              tab === 'deposit' ? 'bg-white/10 text-white border border-white/20' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Admin Credit / Deposit
          </button>
          <button
            onClick={() => setTab('reversal')}
            className={`px-4 py-2 rounded-xl text-sm font-mono transition-all ${
              tab === 'reversal' ? 'bg-white/10 text-white border border-white/20' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Transaction Reversals
          </button>
        </div>

        {/* Tab 1: Administrative Deposit / Credit */}
        {tab === 'deposit' && (
          <GlassCard variant="glowing" className="p-8 max-w-2xl">
            <h3 className="text-xl font-bold text-white font-serif mb-2">Execute Admin Credit</h3>
            <p className="text-xs text-neutral-400 font-mono mb-6">
              Creates explicit double-entry transaction and audit record. Direct balance edits are prohibited.
            </p>

            {depositMessage && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-mono border flex items-center space-x-2 ${
                depositMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'
              }`}>
                {depositMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                <span>{depositMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleAdminCredit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Select Target User Account</label>
                <select
                  required
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-white/40"
                >
                  <option value="" className="bg-neutral-900">-- Choose User Account --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id} className="bg-neutral-900">
                      {u.fullName} ({u.walletId}) - {u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Asset Symbol</label>
                  <select
                    value={depositAsset}
                    onChange={(e) => setDepositAsset(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-sm focus:outline-none"
                  >
                    <option value="PHX" className="bg-neutral-900">Phoenix Coin (PHX)</option>
                    <option value="BTC" className="bg-neutral-900">Bitcoin (BTC)</option>
                    <option value="ETH" className="bg-neutral-900">Ethereum (ETH)</option>
                    <option value="USDT" className="bg-neutral-900">Tether (USDT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Credit Amount</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-mono placeholder-neutral-500 focus:outline-none"
                    placeholder="100.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Mandatory Compliance Reason</label>
                <input
                  type="text"
                  required
                  value={depositReason}
                  onChange={(e) => setDepositReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-sans text-sm focus:outline-none"
                  placeholder="e.g. Approved promotional credit per Ticket #991"
                />
              </div>

              <GlassButton variant="primary" size="lg" className="w-full mt-4" disabled={depositLoading}>
                {depositLoading ? 'Processing Double-Entry Credit...' : 'Execute Administrative Credit'}
              </GlassButton>
            </form>
          </GlassCard>
        )}

        {/* Tab 2: Transaction Reversals */}
        {tab === 'reversal' && (
          <GlassCard variant="glowing" className="p-8 max-w-2xl">
            <h3 className="text-xl font-bold text-white font-serif mb-2">Execute Transaction Reversal</h3>
            <p className="text-xs text-neutral-400 font-mono mb-6">
              Generates a compensating transaction (DEBIT recipient, CREDIT sender). Original history remains intact.
            </p>

            {reversalMessage && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-mono border flex items-center space-x-2 ${
                reversalMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'
              }`}>
                {reversalMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                <span>{reversalMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleAdminReversal} className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Original Transaction UUID</label>
                <input
                  type="text"
                  required
                  value={reversalTxId}
                  onChange={(e) => setReversalTxId(e.target.value.trim())}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-mono placeholder-neutral-500 text-sm focus:outline-none"
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Mandatory Reversal Reason</label>
                <input
                  type="text"
                  required
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-sans text-sm focus:outline-none"
                  placeholder="e.g. Reversed due to fraudulent activity flag"
                />
              </div>

              <GlassButton variant="danger" size="lg" className="w-full mt-4" disabled={reversalLoading}>
                {reversalLoading ? 'Processing Reversal...' : 'Confirm & Execute Compensating Reversal'}
              </GlassButton>
            </form>
          </GlassCard>
        )}
      </main>
    </div>
  );
};
