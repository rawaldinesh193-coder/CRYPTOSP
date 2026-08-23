import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { TransactionRow } from '../components/TransactionRow';
import { Navbar } from '../components/Navbar';
import { Search, RefreshCw } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [assetFilter, setAssetFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (assetFilter) params.append('asset', assetFilter);

      const res = await fetch(`/api/v1/transactions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data.transactions);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token, assetFilter]);

  return (
    <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
      <Navbar />

      <div className="pt-28 pb-20 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-white">
              Ledger History & Audit
            </h1>
            <p className="text-sm text-neutral-400 font-mono mt-1">
              Double-entry atomic ledger logs for {user?.walletId}
            </p>
          </div>

          <button
            onClick={fetchTransactions}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white transition-all self-start md:self-auto flex items-center space-x-2 text-xs font-mono"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Ledger</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative md:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && fetchTransactions()}
              className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/5 border border-white/15 text-white font-mono placeholder-neutral-500 text-sm focus:outline-none focus:border-white/40"
              placeholder="Search by Transaction UUID, Wallet ID, or note..."
            />
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
          </div>

          <div>
            <select
              value={assetFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAssetFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-sm focus:outline-none"
            >
              <option value="" className="bg-neutral-900">All Assets</option>
              <option value="PHX" className="bg-neutral-900">Phoenix Coin (PHX)</option>
              <option value="BTC" className="bg-neutral-900">Bitcoin (BTC)</option>
              <option value="ETH" className="bg-neutral-900">Ethereum (ETH)</option>
              <option value="USDT" className="bg-neutral-900">Tether (USDT)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-neutral-500 font-mono">Loading transaction ledger...</div>
        ) : transactions.length === 0 ? (
          <GlassCard className="p-12 text-center text-neutral-400">
            <p className="text-base font-semibold text-white">No transactions found</p>
            <p className="text-xs text-neutral-500 mt-1">Your ledger history is currently empty.</p>
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
