import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { GlassCard, GlassButton } from '@cryptosp/ui';
import { AdminSidebar } from '../components/AdminSidebar';
import { Settings, Flame, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [platformName, setPlatformName] = useState('CRYPTOSP');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [phoenixCoinPriceUsd, setPhoenixCoinPriceUsd] = useState('10.00');
  const [platformFeePercentage, setPlatformFeePercentage] = useState('0.00');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPlatformName(json.data.platformName || 'CRYPTOSP');
        setMaintenanceMode(json.data.maintenanceMode || false);
        setPhoenixCoinPriceUsd(json.data.phoenixCoinPriceUsd || '10.00');
        setPlatformFeePercentage(json.data.platformFeePercentage || '0.00');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          platformName,
          maintenanceMode,
          phoenixCoinPriceUsd: Number(phoenixCoinPriceUsd),
          platformFeePercentage: Number(platformFeePercentage),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: 'System settings & Phoenix Coin valuation updated successfully.' });
      } else {
        setMessage({ type: 'error', text: json.error?.message || 'Failed to update settings' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white flex bg-liquid-mesh">
      <AdminSidebar />

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl text-white">System Settings & Asset Valuation</h1>
            <p className="text-xs text-neutral-400 font-mono mt-1">Configure Phoenix Coin reference price & platform parameters</p>
          </div>
        </div>

        <GlassCard variant="glowing" className="p-8 max-w-2xl">
          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-mono border flex items-center space-x-2 ${
              message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <label className="block text-xs font-mono text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-2">
                <Flame className="w-4 h-4" />
                <span>Phoenix Coin (PHX) Reference Valuation ($ USD)</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={phoenixCoinPriceUsd}
                onChange={(e) => setPhoenixCoinPriceUsd(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg font-bold focus:outline-none focus:border-amber-400"
              />
              <p className="text-xs text-neutral-400 mt-1 font-mono">Initial default is $10.00. Updating this automatically writes an immutable record in `AssetPrice` price history table.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Platform Name</label>
                <input
                  type="text"
                  required
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Platform Fee (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={platformFeePercentage}
                  onChange={(e) => setPlatformFeePercentage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Maintenance Mode</p>
                <p className="text-xs text-neutral-400 font-mono">Temporarily pause non-admin financial transfers</p>
              </div>

              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 accent-amber-500 cursor-pointer"
              />
            </div>

            <GlassButton variant="primary" size="lg" className="w-full mt-4" disabled={saving}>
              {saving ? 'Saving System Settings...' : 'Save Settings & Update Valuation'}
            </GlassButton>
          </form>
        </GlassCard>
      </main>
    </div>
  );
};
