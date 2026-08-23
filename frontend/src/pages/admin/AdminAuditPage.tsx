import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { GlassCard } from '../../components/GlassCard';
import { AdminSidebar } from '../../components/AdminSidebar';
import { RefreshCw } from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/audit', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setLogs(json.data.auditLogs);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#030305] text-white flex bg-liquid-mesh">
      <AdminSidebar />

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl text-white">Immutable Audit Trail</h1>
            <p className="text-xs text-neutral-400 font-mono mt-1">Permanent cryptographic record of all administrator actions</p>
          </div>

          <button
            onClick={fetchAuditLogs}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <GlassCard className="overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-mono text-neutral-400 uppercase tracking-wider bg-white/[0.02]">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Administrator</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target ID</th>
                <th className="p-4">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-sans">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-neutral-500 font-mono">Loading audit logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-neutral-500 font-mono">No audit records found</td></tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-mono text-xs text-neutral-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-mono text-xs text-white">{log.adminEmail}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 text-xs font-mono rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-neutral-300">{log.targetId}</td>
                    <td className="p-4 text-xs text-neutral-300 italic">{log.reason || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </GlassCard>
      </main>
    </div>
  );
};
