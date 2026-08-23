import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard, GlassButton } from '@cryptosp/ui';
import { Flame, ArrowRight, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
        login(json.data.token, json.data.user);
        navigate(json.data.user.role !== 'USER' ? '/admin' : '/dashboard');
      } else {
        setError(json.error?.message || 'Login failed');
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
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className="font-serif text-3xl font-bold tracking-wider text-white">CRYPTOSP</span>
          </Link>
          <h2 className="text-xl font-semibold text-white mt-6">Welcome back</h2>
          <p className="text-sm text-neutral-400 mt-1">Sign in to your digital wallet</p>
        </div>

        <GlassCard variant="glowing" className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-all font-sans"
                  placeholder="name@example.com"
                />
                <Mail className="w-5 h-5 text-neutral-500 absolute right-4 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-all font-sans"
                  placeholder="••••••••"
                />
                <Lock className="w-5 h-5 text-neutral-500 absolute right-4 top-3.5" />
              </div>
            </div>

            <GlassButton variant="primary" size="lg" className="w-full mt-4" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In to Wallet'}
            </GlassButton>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-neutral-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-white hover:underline font-semibold">
              Open a Wallet
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
