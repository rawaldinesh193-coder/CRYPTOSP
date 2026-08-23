import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { GlassCard, GlassButton } from '@cryptosp/ui';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Search, Lock, Unlock, CheckCircle2 } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionType, setActionType] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/v1/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setUsers(json.data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token, statusFilter]);

  const handleUserAction = async () => {
    if (!selectedUser || !actionType || !actionReason) return;
    setActionLoading(true);
    setActionSuccess(null);

    try {
      const res = await fetch('/api/v1/admin/users/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: actionType,
          reason: actionReason,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActionSuccess(`User ${selectedUser.username} action ${actionType} performed.`);
        setSelectedUser(null);
        setActionType(null);
        setActionReason('');
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed user action:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white flex bg-liquid-mesh">
      <AdminSidebar />

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl text-white">User Account Control</h1>
            <p className="text-xs text-neutral-400 font-mono mt-1">Manage Cryptosp accounts, wallet freezes & access suspensions</p>
          </div>
        </div>

        {actionSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-mono flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative md:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && fetchUsers()}
              className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/5 border border-white/15 text-white font-mono placeholder-neutral-500 text-sm focus:outline-none focus:border-white/40"
              placeholder="Search Username, Email, Full Name, or CSP Wallet ID..."
            />
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-sm focus:outline-none"
            >
              <option value="" className="bg-neutral-900">All Account Statuses</option>
              <option value="ACTIVE" className="bg-neutral-900">Active</option>
              <option value="RESTRICTED" className="bg-neutral-900">Restricted</option>
              <option value="SUSPENDED" className="bg-neutral-900">Suspended</option>
            </select>
          </div>
        </div>

        <GlassCard className="overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-mono text-neutral-400 uppercase tracking-wider bg-white/[0.02]">
                <th className="p-4">User Details</th>
                <th className="p-4">Wallet ID</th>
                <th className="p-4">Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Financial State</th>
                <th className="p-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-sans">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-neutral-500 font-mono">Loading user accounts...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-neutral-500 font-mono">No users found</td></tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="p-4">
                      <p className="font-semibold text-white">{u.fullName}</p>
                      <p className="text-xs text-neutral-400 font-mono">@{u.username} ({u.email})</p>
                    </td>
                    <td className="p-4 font-mono text-xs font-bold text-amber-400">{u.walletId}</td>
                    <td className="p-4 font-mono text-xs text-neutral-300">{u.role}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-mono ${
                        u.accountStatus === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs">
                      {u.isFrozen ? (
                        <span className="text-red-400 font-bold flex items-center"><Lock className="w-3.5 h-3.5 mr-1" /> FROZEN</span>
                      ) : (
                        <span className="text-emerald-400 font-bold flex items-center"><Unlock className="w-3.5 h-3.5 mr-1" /> NORMAL</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => { setSelectedUser(u); setActionType(u.isFrozen ? 'UNFREEZE_WALLET' : 'FREEZE_WALLET'); }}
                        className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition-all"
                      >
                        {u.isFrozen ? 'Unfreeze' : 'Freeze'}
                      </button>
                      <button
                        onClick={() => { setSelectedUser(u); setActionType(u.accountStatus === 'SUSPENDED' ? 'UNSUSPEND_USER' : 'SUSPEND_USER'); }}
                        className="px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-xs font-mono text-red-300 border border-red-500/30 transition-all"
                      >
                        {u.accountStatus === 'SUSPENDED' ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </GlassCard>

        {selectedUser && actionType && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
            <GlassCard variant="glowing" className="p-8 max-w-md w-full">
              <h3 className="text-xl font-serif text-white font-bold mb-2">
                Confirm {actionType}
              </h3>
              <p className="text-xs text-neutral-400 font-mono mb-4">
                Target User: <strong>{selectedUser.fullName}</strong> ({selectedUser.walletId})
              </p>

              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
                  Mandatory Administrative Reason
                </label>
                <textarea
                  required
                  rows={3}
                  value={actionReason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setActionReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-sans text-sm focus:outline-none focus:border-white/40"
                  placeholder="State clear operational reason for compliance audit trail..."
                />
              </div>

              <div className="flex gap-4 mt-6">
                <GlassButton variant="outline" size="md" className="w-1/2" onClick={() => setSelectedUser(null)}>
                  Cancel
                </GlassButton>
                <GlassButton variant="danger" size="md" className="w-1/2" disabled={!actionReason || actionLoading} onClick={handleUserAction}>
                  {actionLoading ? 'Executing...' : 'Confirm Action'}
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        )}
      </main>
    </div>
  );
};
