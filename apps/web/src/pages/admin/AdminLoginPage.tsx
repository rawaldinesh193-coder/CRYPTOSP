import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { GlassCard, GlassButton } from '@cryptosp/ui';
import { ShieldAlert, Lock, Mail } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (json.success) {
        if (json.data.user.role === 'USER') {
          setError('Access denied: Regular user accounts cannot log into Administrator Control Center.');
          return;
        }
        login(json.data.token, json.data.user);
        navigate('/admin');
      } else {
        setError(json.error?.message || 'Admin authentication failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center p-6 bg-liquid-mesh">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-white">CRYPTOSP Admin Control</h2>
          <p className="text-xs text-neutral-400 font-mono mt-1 uppercase tracking-widest">Privileged Access Only</p>
        </div>

        <GlassCard variant="glowing" className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-all font-sans"
                placeholder="admin@cryptosp.internal"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-all font-sans"
                placeholder="••••••••"
              />
            </div>

            <GlassButton variant="primary" size="lg" className="w-full mt-4" disabled={loading}>
              {loading ? 'Verifying Credentials...' : 'Authenticate Admin Session'}
            </GlassButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
