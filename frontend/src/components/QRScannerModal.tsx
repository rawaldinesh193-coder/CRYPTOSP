import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { GlassCard } from './GlassCard';
import { X, Camera, Upload, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

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
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    setError(null);

    const timer = setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, selectedCameraId]);

  const startScanner = async () => {
    const elementId = 'cryptosp-qr-reader';
    const readerElement = document.getElementById(elementId);
    if (!readerElement) return;

    try {
      if (qrCodeScannerRef.current) {
        await stopScanner();
      }

      const html5Qrcode = new Html5Qrcode(elementId);
      qrCodeScannerRef.current = html5Qrcode;

      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        const activeCameraId = selectedCameraId || devices[devices.length - 1].id;

        const config = {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.75);
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0,
        };

        await html5Qrcode.start(
          activeCameraId,
          config,
          (decodedText) => {
            handleScanText(decodedText);
          },
          () => {}
        );
        setIsScanning(true);
      } else {
        setError('No video cameras detected on this device. You can upload a QR image below.');
      }
    } catch (err: any) {
      console.warn('Camera scan failed to start, attempting constraint fallback:', err);
      try {
        if (qrCodeScannerRef.current) {
          const config = { fps: 15, qrbox: { width: 220, height: 220 } };
          await qrCodeScannerRef.current.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => handleScanText(decodedText),
            () => {}
          );
          setIsScanning(true);
        }
      } catch (fallbackErr: any) {
        setError('Camera permission denied or camera unavailable. Try selecting a camera or uploading a QR image file.');
        setIsScanning(false);
      }
    }
  };

  const stopScanner = async () => {
    if (qrCodeScannerRef.current && qrCodeScannerRef.current.isScanning) {
      try {
        await qrCodeScannerRef.current.stop();
        qrCodeScannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      } finally {
        qrCodeScannerRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      const elementId = 'cryptosp-qr-reader';
      let html5Qrcode = qrCodeScannerRef.current;
      if (!html5Qrcode) {
        html5Qrcode = new Html5Qrcode(elementId);
        qrCodeScannerRef.current = html5Qrcode;
      }

      const decodedText = await html5Qrcode.scanFile(file, true);
      handleScanText(decodedText);
    } catch (err: any) {
      setError('Could not detect a valid QR code in the uploaded image. Please try another photo.');
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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 z-50">
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
          <p className="text-xs text-neutral-400 font-mono mt-1">Point camera or upload a QR image</p>
        </div>

        {cameras.length > 1 && (
          <div className="mb-4">
            <select
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs focus:outline-none"
            >
              {cameras.map((cam) => (
                <option key={cam.id} value={cam.id} className="bg-neutral-900">
                  {cam.label || `Camera ${cam.id.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono flex items-center space-x-2 my-4">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black min-h-[260px] flex items-center justify-center">
          <div id="cryptosp-qr-reader" className="w-full h-64" />
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none border-2 border-amber-400/60 rounded-2xl animate-pulse" />
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-mono text-xs flex items-center justify-center space-x-2 transition-all"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Upload QR Image / Photo</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="mt-4 text-center text-[11px] text-neutral-500 font-mono">
          Supports live camera & image files (`CSP-XXXXXXXXXXXX` or payment JSON)
        </div>
      </GlassCard>
    </div>
  );
};
