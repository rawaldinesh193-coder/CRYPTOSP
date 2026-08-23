import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { GlassCard } from '../components/GlassCard';
import { QRScannerModal, QRScannerResult } from '../components/QRScannerModal';
import { Camera, ArrowRight, QrCode } from 'lucide-react';
import { GlassButton } from '../components/GlassButton';

export const ScanPage: React.FC = () => {
  const navigate = useNavigate();
  const [isScannerOpen, setIsScannerOpen] = useState(true);

  const handleScanSuccess = (result: QRScannerResult) => {
    const params = new URLSearchParams();
    if (result.walletId) params.append('walletId', result.walletId);
    if (result.amount) params.append('amount', result.amount);
    if (result.asset) params.append('asset', result.asset);
    navigate(`/send?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
      <Navbar />

      <div className="pt-32 pb-24 max-w-xl mx-auto px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-6">
          <QrCode className="w-8 h-8" />
        </div>

        <h1 className="font-serif text-4xl md:text-5xl text-white mb-3">
          QR Code & Barcode Scanner
        </h1>
        <p className="text-sm text-neutral-400 font-sans mb-8">
          Instant camera detection & photo upload parser for Cryptosp payments
        </p>

        <GlassCard variant="glowing" className="p-8">
          <GlassButton
            variant="primary"
            size="lg"
            onClick={() => setIsScannerOpen(true)}
            className="w-full flex items-center justify-center space-x-2 bg-amber-400 text-black hover:bg-amber-300"
          >
            <Camera className="w-5 h-5" />
            <span>Launch Camera Scanner</span>
          </GlassButton>

          <p className="text-xs text-neutral-500 font-mono mt-6">
            Scans Cryptosp Wallet IDs (`CSP-XXXXXXXXXXXX`), payment JSON payloads, or uploaded QR screenshots.
          </p>
        </GlassCard>

        <QRScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={handleScanSuccess}
        />
      </div>

      <Footer />
    </div>
  );
};
