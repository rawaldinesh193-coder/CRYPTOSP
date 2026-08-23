import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassCard, TransactionRow } from '@cryptosp/ui';
import { Navbar } from '../components/Navbar';
import { Search, RefreshCw } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterStatus) params.append('status', filterStatus);
      if (search) params.append('search', search);

      const res = await fetch(`/api/v1/transactions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data.transactions);
      }
    } catch (err) {
      console.error('Failed to load transaction history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token, filterType, filterStatus]);

  return (
    <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
      <Navbar />

      <div className="pt-28 pb-20 max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-white">
              Transaction History
            </h1>
            <p className="text-sm text-neutral-400 font-mono mt-1">
              Double-entry database audit trail
            </p>
          </div>

          <button
            onClick={fetchTransactions}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white transition-all self-start md:self-auto"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && fetchTransactions()}
              className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/5 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 text-sm font-sans"
              placeholder="Search ID, Wallet, Reference..."
            />
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-sm focus:outline-none"
            >
              <option value="" className="bg-neutral-900">All Transaction Types</option>
              <option value="TRANSFER" className="bg-neutral-900">Transfers</option>
              <option value="DEPOSIT" className="bg-neutral-900">Admin Credits</option>
              <option value="REVERSAL" className="bg-neutral-900">Reversals</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-sm focus:outline-none"
            >
              <option value="" className="bg-neutral-900">All Statuses</option>
              <option value="COMPLETED" className="bg-neutral-900">Completed</option>
              <option value="PENDING" className="bg-neutral-900">Pending</option>
              <option value="REVERSED" className="bg-neutral-900">Reversed</option>
              <option value="FAILED" className="bg-neutral-900">Failed</option>
            </select>
          </div>
        </div>

        {/* Transaction History Rows */}
        {loading ? (
          <div className="p-8 text-center text-neutral-500 font-mono">Loading transaction ledger...</div>
        ) : transactions.length === 0 ? (
          <GlassCard className="p-12 text-center text-neutral-400">
            <p className="text-base font-semibold text-white">No transactions found</p>
            <p className="text-xs text-neutral-500 mt-1">No ledger entries match your filter criteria.</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx: any) => (
              <TransactionRow
                key={tx.id}
                id={tx.id}
                type={tx.type}
                status={tx.status}
                asset={tx.asset}
                amount={tx.amount}
                senderWalletId={tx.senderWalletId}
                recipientWalletId={tx.recipientWalletId}
                myWalletId={user?.walletId || ''}
                createdAt={tx.createdAt}
                note={tx.note}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
