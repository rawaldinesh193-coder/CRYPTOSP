import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard, GlassButton } from '@cryptosp/ui';
import { Flame, User, Mail, Lock, Phone } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
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
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, fullName, phone: phone || undefined }),
      });
      const json = await res.json();
      if (json.success) {
        login(json.data.token, json.data.user);
        navigate('/dashboard');
      } else {
        setError(json.error?.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center p-6 bg-liquid-mesh py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className="font-serif text-3xl font-bold tracking-wider text-white">CRYPTOSP</span>
          </Link>
          <h2 className="text-xl font-semibold text-white mt-6">Open Your Digital Wallet</h2>
          <p className="text-sm text-neutral-400 mt-1">Get your unique CSP-XXXXXXXXXXXX Wallet ID</p>
        </div>

        <GlassCard variant="glowing" className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-all font-sans"
                placeholder="Alex Morgan"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-all font-sans"
                placeholder="alexmorgan"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-all font-sans"
                placeholder="alex@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Phone (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-all font-sans"
                placeholder="+1 555 019 2834"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-all font-sans"
                placeholder="Minimum 8 characters"
              />
            </div>

            <GlassButton variant="primary" size="lg" className="w-full mt-4" disabled={loading}>
              {loading ? 'Creating Wallet...' : 'Create Account & Generate Wallet'}
            </GlassButton>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center text-sm text-neutral-400">
            Already have a wallet?{' '}
            <Link to="/login" className="text-white hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
