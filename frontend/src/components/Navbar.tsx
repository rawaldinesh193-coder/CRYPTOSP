import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassButton } from './GlassButton';
import { QRScannerModal, QRScannerResult } from './QRScannerModal';
import { Flame, Wallet, LogOut, ArrowRight, QrCode } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleScanSuccess = (result: QRScannerResult) => {
    const params = new URLSearchParams();
    if (result.walletId) params.append('walletId', result.walletId);
    if (result.amount) params.append('amount', result.amount);
    if (result.asset) params.append('asset', result.asset);
    navigate(`/send?${params.toString()}`);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-white/20 via-white/10 to-transparent border border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:border-white/40 transition-all">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-2xl tracking-wider text-white font-bold">
              CRYPTOSP
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-neutral-300">
            <Link to="/markets" className="hover:text-white transition-colors">Markets</Link>
            <Link to="/phoenix" className="hover:text-white transition-colors flex items-center space-x-1">
              <span>Phoenix Coin</span>
              <span className="px-1.5 py-0.2 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-mono">$10</span>
            </Link>
            <Link to="/security" className="hover:text-white transition-colors">Security</Link>
            <Link to="/scan" className="hover:text-amber-400 transition-colors text-amber-300 flex items-center space-x-1 font-mono">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Scan QR</span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center space-x-1.5 text-amber-300 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Scan QR</span>
            </GlassButton>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/dashboard">
                  <GlassButton variant="primary" size="sm" className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4" />
                    <span className="hidden sm:inline">Wallet</span>
                  </GlassButton>
                </Link>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <GlassButton variant="outline" size="sm">
                    Sign In
                  </GlassButton>
                </Link>
                <Link to="/register" className="hidden sm:block">
                  <GlassButton variant="primary" size="sm" className="flex items-center space-x-1.5">
                    <span>Open Wallet</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </GlassButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
};
