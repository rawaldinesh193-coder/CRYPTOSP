import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard, GlassButton, TransactionRow } from '@cryptosp/ui';
import { Navbar } from '../components/Navbar';
import { Wallet, Send, ArrowDownLeft, QrCode, Flame, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const [walletData, setWalletData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    if (!token) return;
    try {
      const [walletRes, txRes] = await Promise.all([
        fetch('/api/v1/wallets/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/v1/transactions?limit=5', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const walletJson = await walletRes.json();
      const txJson = await txRes.json();

      if (walletJson.success) setWalletData(walletJson.data);
      if (txJson.success) setTransactions(txJson.data.transactions);
    } catch (err) {
      console.error('Failed to load wallet dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
      <Navbar />

      <div className="pt-28 pb-20 max-w-7xl mx-auto px-6">
        {/* Account Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="font-serif text-3xl md:text-4xl text-white">
                Welcome, {user?.fullName}
              </h1>
              {walletData?.isFrozen && (
                <span className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full text-xs font-mono flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  <span>Wallet Frozen</span>
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-400 font-mono mt-1">
              Wallet ID: <strong className="text-white font-bold">{user?.walletId}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadDashboardData}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
              title="Refresh Ledger Balances"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link to="/send">
              <GlassButton variant="primary" size="md" className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Send Money</span>
              </GlassButton>
            </Link>
            <Link to="/receive">
              <GlassButton variant="secondary" size="md" className="flex items-center space-x-2">
                <QrCode className="w-4 h-4" />
                <span>Receive / QR</span>
              </GlassButton>
            </Link>
          </div>
        </div>

        {/* Total Portfolio Valuation Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <GlassCard variant="glowing" className="p-8 lg:col-span-2">
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">Total Portfolio Balance</p>
            <div className="flex items-baseline space-x-3 mt-2">
              <span className="text-4xl md:text-6xl font-mono font-bold text-white tracking-tight">
                ${walletData ? walletData.totalPortfolioUsd : '0.00'}
              </span>
              <span className="text-sm text-neutral-500 font-mono">USD</span>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-neutral-400 font-mono">Phoenix Coin (PHX)</p>
                <p className="text-lg font-mono font-bold text-amber-400 mt-1">
                  {walletData?.balances?.PHX?.available || '0.0000'} PHX
                </p>
                <p className="text-xs text-neutral-500 font-mono">
                  ≈ ${walletData?.balances?.PHX?.usdValue || '0.00'} USD
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-mono">PHX Valuation</p>
                <p className="text-lg font-mono font-bold text-white mt-1">
                  ${walletData?.phoenixCoinPriceUsd || '10.00'}
                </p>
                <p className="text-xs text-emerald-400 font-mono">Reference Price</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-mono">Ledger Invariants</p>
                <p className="text-sm font-mono text-emerald-400 flex items-center mt-1">
                  <ShieldCheck className="w-4 h-4 mr-1" />
                  Double-Entry OK
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Quick Action Navigation */}
          <GlassCard className="p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-serif text-white font-bold mb-2">Quick Actions</h3>
              <p className="text-xs text-neutral-400 mb-6">Transfer assets instantly across Cryptosp digital wallet network</p>
            </div>

            <div className="space-y-3">
              <Link to="/send" className="block">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <Send className="w-5 h-5 text-white" />
                    <div>
                      <p className="text-sm font-semibold text-white">Send Asset</p>
                      <p className="text-xs text-neutral-400">By Wallet ID or QR</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/receive" className="block">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <QrCode className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-sm font-semibold text-white">Generate QR</p>
                      <p className="text-xs text-neutral-400">Receive payment</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* Recent Transactions List */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl text-white">Recent Activity</h2>
            <Link to="/transactions" className="text-xs font-mono text-neutral-400 hover:text-white transition-colors">
              View All Transactions →
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-neutral-500 font-mono">Loading transaction ledger...</div>
          ) : transactions.length === 0 ? (
            <GlassCard className="p-12 text-center text-neutral-400">
              <p className="text-base font-semibold text-white">No transactions yet</p>
              <p className="text-xs text-neutral-500 mt-1">Your double-entry ledger history will appear here once you send or receive funds.</p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
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
    </div>
  );
};
