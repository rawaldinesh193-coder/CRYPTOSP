import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { GlassCard } from './GlassCard';
import { X, Camera, AlertCircle } from 'lucide-react';

export interface QRScannerResult {
  walletId: string;
  asset?: string;
  amount?: string;
  reference?: string;
}

export interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (result: QRScannerResult) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    setError(null);
    setIsScanning(true);

    const elementId = 'cryptosp-qr-reader';
    const html5Qrcode = new Html5Qrcode(elementId);
    qrCodeScannerRef.current = html5Qrcode;

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5Qrcode
      .start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleScanText(decodedText);
        },
        () => {
          // Ignore frame parse errors
        }
      )
      .catch((err) => {
        console.warn('Primary camera failed, trying fallback camera:', err);
        html5Qrcode
          .start(
            { facingMode: 'user' },
            config,
            (decodedText) => {
              handleScanText(decodedText);
            },
            () => {}
          )
          .catch((fallbackErr) => {
            setError('Camera permission denied or camera not available. Please allow camera access.');
            setIsScanning(false);
          });
      });

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = () => {
    if (qrCodeScannerRef.current && qrCodeScannerRef.current.isScanning) {
      qrCodeScannerRef.current
        .stop()
        .then(() => {
          qrCodeScannerRef.current?.clear();
          qrCodeScannerRef.current = null;
        })
        .catch((err) => console.warn('Failed to stop QR scanner:', err));
    }
  };

  const handleScanText = (text: string) => {
    stopScanner();
    onClose();

    try {
      if (text.startsWith('{')) {
        const parsed = JSON.parse(text);
        if (parsed.walletId) {
          onScanSuccess({
            walletId: parsed.walletId,
            asset: parsed.asset || 'PHX',
            amount: parsed.amount || undefined,
            reference: parsed.reference || undefined,
          });
          return;
        }
      }

      const match = text.match(/CSP-[A-Z0-9]{12}/i);
      if (match) {
        onScanSuccess({ walletId: match[0].toUpperCase() });
        return;
      }

      if (text.includes('walletId=')) {
        const url = new URL(text);
        const walletId = url.searchParams.get('walletId');
        const amount = url.searchParams.get('amount') || undefined;
        const asset = url.searchParams.get('asset') || undefined;
        if (walletId) {
          onScanSuccess({ walletId: walletId.toUpperCase(), amount, asset });
          return;
        }
      }

      onScanSuccess({ walletId: text.trim().toUpperCase() });
    } catch (err) {
      onScanSuccess({ walletId: text.trim().toUpperCase() });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fadeIn">
      <GlassCard variant="glowing" className="p-8 max-w-md w-full relative">
        <button
          onClick={() => {
            stopScanner();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-white">Scan QR / Barcode</h3>
          <p className="text-xs text-neutral-400 font-mono mt-1">Point camera at Cryptosp payment QR code</p>
        </div>

        {error ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono flex items-center space-x-2 my-4">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black">
            <div id="cryptosp-qr-reader" className="w-full h-64" />
            <div className="absolute inset-0 pointer-events-none border-2 border-amber-400/50 rounded-2xl animate-pulse" />
          </div>
        )}

        <div className="mt-6 text-center text-xs text-neutral-500 font-mono">
          Supports Cryptosp Wallet QR codes & Payment Request payload links
        </div>
      </GlassCard>
    </div>
  );
};
