import React from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';

export interface TransactionRowProps {
  id: string;
  type: string;
  status: string;
  asset: string;
  amount: string;
  senderWalletId?: string;
  recipientWalletId?: string;
  myWalletId: string;
  createdAt: string;
  note?: string;
  onClick?: () => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  id,
  type,
  status,
  asset,
  amount,
  senderWalletId,
  recipientWalletId,
  myWalletId,
  createdAt,
  note,
  onClick,
}) => {
  const isReceived = recipientWalletId === myWalletId || type === 'DEPOSIT';
  const isReversal = type === 'REVERSAL' || status === 'REVERSED';

  const getStatusBadge = () => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Completed</span>;
      case 'PENDING':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>;
      case 'REVERSED':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Reversed</span>;
      case 'FAILED':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Failed</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">{status}</span>;
    }
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 my-2 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all cursor-pointer group"
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl border ${
          isReversal ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
          isReceived ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
          'bg-white/5 border-white/10 text-neutral-300'
        }`}>
          {isReversal ? <RefreshCw className="w-5 h-5" /> : isReceived ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-white">
              {type === 'DEPOSIT' ? 'Admin Credit' : isReversal ? 'Transaction Reversal' : isReceived ? 'Received' : 'Sent'}
            </span>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            {isReceived ? `From: ${senderWalletId || 'System'}` : `To: ${recipientWalletId}`}
          </p>
          {note && <p className="text-xs text-neutral-500 italic mt-0.5">"{note}"</p>}
        </div>
      </div>

      <div className="text-right">
        <p className={`text-base font-bold font-mono ${
          isReversal ? 'text-purple-400' : isReceived ? 'text-emerald-400' : 'text-white'
        }`}>
          {isReceived ? '+' : '-'}{amount} {asset}
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};
