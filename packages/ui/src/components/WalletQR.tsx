import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface WalletQRProps {
  walletId: string;
  asset?: string;
  amount?: string;
  reference?: string;
  size?: number;
}

export const WalletQR: React.FC<WalletQRProps> = ({
  walletId,
  asset = 'PHX',
  amount,
  reference,
  size = 200,
}) => {
  // Construct safe public payload (NEVER exposes secrets, passwords, or auth tokens)
  const payload = JSON.stringify({
    type: 'CRYPTOSP_PAYMENT_REQUEST',
    walletId,
    asset,
    amount: amount || undefined,
    reference: reference || undefined,
  });

  return (
    <div className="flex flex-col items-center p-6 bg-black/60 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
      <div className="p-4 bg-white rounded-xl shadow-inner">
        <QRCodeSVG
          value={payload}
          size={size}
          bgColor="#FFFFFF"
          fgColor="#000000"
          level="H"
          includeMargin={false}
        />
      </div>
      <div className="mt-4 text-center">
        <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider">Cryptosp Wallet ID</p>
        <p className="text-sm font-semibold text-white font-mono mt-1 tracking-wider">{walletId}</p>
      </div>
    </div>
  );
};
