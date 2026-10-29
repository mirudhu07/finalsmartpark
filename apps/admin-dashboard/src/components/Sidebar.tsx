import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  CalendarCheck,
  AlertTriangle,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/facilities', label: 'Facilities & Zones', icon: Building2 },
    { to: '/forecasts', label: 'ML Forecast Analytics', icon: TrendingUp },
    { to: '/reservations', label: 'Reservations', icon: CalendarCheck },
    { to: '/incidents', label: 'Incidents & Audit', icon: AlertTriangle },
  ];

  return (
    <aside className="w-64 bg-brand-navy text-white flex flex-col min-h-screen border-r border-slate-800 shrink-0">
      {/* Brand Header with Official Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
        <img
          src="/smartpark-logo.png"
          alt="SmartPark AI Logo"
          className="w-10 h-10 rounded-xl object-contain bg-white/10 p-1 shadow-sm"
        />
        <div>
          <h1 className="font-bold text-lg leading-tight text-white tracking-tight">SmartPark AI</h1>
          <p className="text-xs text-sky-400 font-medium tracking-wide">OPERATOR PORTAL</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-md'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-blue/30 text-sky-400 flex items-center justify-center font-bold text-xs uppercase border border-sky-400/30">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
