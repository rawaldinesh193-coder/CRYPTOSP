import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Flame, LayoutDashboard, Users, CreditCard, ShieldCheck, Settings, LogOut } from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { admin, logout } = useAdminAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'User Control', path: '/admin/users', icon: Users },
    { label: 'Finance Center', path: '/admin/finance', icon: CreditCard },
    { label: 'Audit Logs', path: '/admin/audit', icon: ShieldCheck },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-black/80 border-r border-white/10 flex flex-col justify-between h-screen sticky top-0 p-6 backdrop-blur-xl">
      <div>
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-white tracking-wider">CRYPTOSP</h2>
            <p className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">Admin Control</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-white/10">
        <div className="mb-4">
          <p className="text-xs font-semibold text-white font-mono">{admin?.fullName}</p>
          <p className="text-[10px] text-amber-400 font-mono uppercase">{admin?.role}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 text-xs font-medium transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Admin System</span>
        </button>
      </div>
    </aside>
  );
};
