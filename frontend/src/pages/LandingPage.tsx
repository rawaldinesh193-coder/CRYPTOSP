import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { MarketTicker } from '../components/MarketTicker';
import { QRScannerModal, QRScannerResult } from '../components/QRScannerModal';
import { Flame, CheckCircle2, QrCode } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [marketData, setMarketData] = useState<any[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/v1/markets')
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && Array.isArray(json.data?.assets)) setMarketData(json.data.assets);
      })
      .catch((err) => console.error('Failed to load market data:', err));
  }, []);

  const handleScanSuccess = (result: QRScannerResult) => {
    const params = new URLSearchParams();
    if (result.walletId) params.append('walletId', result.walletId);
    if (result.amount) params.append('amount', result.amount);
    if (result.asset) params.append('asset', result.asset);
    navigate(`/send?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white overflow-x-hidden bg-liquid-mesh">
      <Navbar />

      <section className="relative pt-36 pb-24 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/15 backdrop-blur-xl mb-8">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono text-neutral-300">Phoenix Coin Reference Value: <strong className="text-white font-bold">$10.00 USD</strong></span>
        </div>

        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight text-white max-w-5xl mx-auto leading-[1.05]">
          The cinematic platform for digital value.
        </h1>

        <p className="mt-8 text-lg md:text-xl text-neutral-400 font-sans max-w-3xl mx-auto font-light leading-relaxed">
          CRYPTOSP combines liquid glass aesthetics with production-grade PostgreSQL double-entry accounting. Transfer internal Phoenix Coin ($10 reference value) and supported assets in milliseconds.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <GlassButton
            variant="secondary"
            size="lg"
            onClick={() => setIsScannerOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 text-amber-300 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"
          >
            <QrCode className="w-5 h-5 text-amber-400" />
            <span>Scan QR / Barcode</span>
          </GlassButton>

          <Link to="/register" className="w-full sm:w-auto">
            <GlassButton variant="primary" size="lg" className="w-full sm:w-auto">
              Create Cryptosp Account
            </GlassButton>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <GlassButton variant="outline" size="lg" className="w-full sm:w-auto">
              Access Wallet
            </GlassButton>
          </Link>
        </div>

        <div className="mt-16 relative max-w-5xl mx-auto">
          <GlassCard variant="glowing" className="p-8 text-left border border-white/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-white/10 gap-4">
              <div>
                <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">Global Portfolio Balance</p>
                <h3 className="text-3xl md:text-5xl font-mono font-bold text-white mt-1">$10,480.00 <span className="text-xs text-neutral-500 font-normal">USD</span></h3>
              </div>
              <div className="flex items-center space-x-3">
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                  Ledger Balanced 0.00 Net
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300 text-xs font-mono">
                  Wallet ID: CSP-98A72F4109B3
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                <p className="text-xs font-mono text-amber-400">Phoenix Coin (PHX)</p>
                <p className="text-xl font-mono font-bold text-white mt-1">1,000.00 <span className="text-xs font-normal text-neutral-400">PHX</span></p>
                <p className="text-xs text-neutral-500 mt-1">≈ $10,000.00 USD ($10/PHX)</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                <p className="text-xs font-mono text-neutral-400">Bitcoin (BTC)</p>
                <p className="text-xl font-mono font-bold text-white mt-1">0.0074 <span className="text-xs font-normal text-neutral-400">BTC</span></p>
                <p className="text-xs text-neutral-500 mt-1">≈ $480.00 USD</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                <p className="text-xs font-mono text-neutral-400">Tether (USDT)</p>
                <p className="text-xl font-mono font-bold text-white mt-1">0.00 <span className="text-xs font-normal text-neutral-400">USDT</span></p>
                <p className="text-xs text-neutral-500 mt-1">≈ $0.00 USD</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {marketData.length > 0 && <MarketTicker assets={marketData} />}

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-mono uppercase tracking-widest">
              Internal Asset Architecture
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-white mt-4 leading-tight">
              Phoenix Coin ($10 USD Reference Valuation)
            </h2>
            <p className="mt-6 text-neutral-400 font-sans leading-relaxed">
              Phoenix Coin is Cryptosp's internal platform digital asset designed for instant, zero-friction settlement between users. The reference valuation ($10.00) is dynamically managed via the administrator control panel with complete price history auditing.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-neutral-300">
              <li className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Instant user-to-user transfers by Wallet ID or QR scanner</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Configurable valuation backed by database price logs</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Double-entry ledger entry generated for every movement</span>
              </li>
            </ul>
          </div>

          <GlassCard variant="glowing" className="p-8">
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Phoenix Coin</h4>
                  <p className="text-xs text-neutral-400 font-mono">Asset Symbol: PHX</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-white/10 rounded-lg text-sm font-mono font-bold text-white">$10.00 USD</span>
            </div>

            <div className="space-y-4 mt-6 text-sm">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-neutral-400">Total Supply In Circulation</span>
                <span className="font-mono text-white font-semibold">Ledger Projected</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-neutral-400">Transfer Settlement Time</span>
                <span className="font-mono text-emerald-400 font-semibold">&lt; 100 ms</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-neutral-400">Platform Transaction Fee</span>
                <span className="font-mono text-white font-semibold">0.00%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-400">Accounting Invariant</span>
                <span className="font-mono text-amber-400 font-semibold">Strict Zero Net Imbalance</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      <Footer />

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};
