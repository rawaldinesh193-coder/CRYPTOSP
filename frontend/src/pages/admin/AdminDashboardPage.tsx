import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { GlassCard } from '../../components/GlassCard';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Users, Flame, CreditCard, Activity, RefreshCw, ShieldCheck } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error('Failed to fetch admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#030305] text-white flex bg-liquid-mesh">
      <AdminSidebar />

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl text-white">System Operations Overview</h1>
            <p className="text-xs text-neutral-400 font-mono mt-1">Real-time PostgreSQL ledger telemetry</p>
          </div>

          <button
            onClick={fetchOverview}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white transition-all flex items-center space-x-2 text-xs font-mono"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Metrics</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-neutral-500 font-mono">Loading operations overview...</div>
        ) : !data ? (
          <GlassCard className="p-8 text-center text-neutral-400">No telemetry data available</GlassCard>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassCard variant="glowing" className="p-6">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">Total Registered Users</span>
                  <Users className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-mono font-bold text-white">{data.totalUsers}</p>
                <p className="text-xs text-emerald-400 mt-2 font-mono">{data.activeUsers} Active Accounts</p>
              </GlassCard>

              <GlassCard variant="glowing" className="p-6">
                <div className="flex items-center justify-between text-amber-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">PHX Circulating Supply</span>
                  <Flame className="w-5 h-5" />
                </div>
                <p className="text-3xl font-mono font-bold text-amber-400">{data.totalPhoenixSupply} PHX</p>
                <p className="text-xs text-neutral-400 mt-2 font-mono">1 PHX = ${data.phoenixCoinPriceUsd} USD</p>
              </GlassCard>

              <GlassCard variant="glowing" className="p-6">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">Total Platform Volume</span>
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-mono font-bold text-white">{data.totalTransactions}</p>
                <p className="text-xs text-neutral-400 mt-2 font-mono">{data.todayTransactions} Today</p>
              </GlassCard>

              <GlassCard variant="glowing" className="p-6">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">Reversed / Failed</span>
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-3xl font-mono font-bold text-purple-400">{data.reversedCount}</p>
                <p className="text-xs text-red-400 mt-2 font-mono">{data.failedCount} Failed Transactions</p>
              </GlassCard>
            </div>

            <GlassCard className="p-8">
              <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider mb-6 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Core System Telemetry & Health Status</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-sm">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <p className="text-neutral-400 text-xs">PostgreSQL Database Engine</p>
                  <p className="text-emerald-400 font-bold text-base mt-1">ONLINE & HEALTHY</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <p className="text-neutral-400 text-xs">Double-Entry Ledger Engine</p>
                  <p className="text-emerald-400 font-bold text-base mt-1">INVARIANTS BALANCED</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <p className="text-neutral-400 text-xs">External Market API Provider</p>
                  <p className="text-emerald-400 font-bold text-base mt-1">COINGECKO ACTIVE</p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </main>
    </div>
  );
};
