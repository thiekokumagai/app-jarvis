import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, Link2, Settings, LogOut, Shield, Wifi } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Assistente', path: '/app', icon: Bot },
    { label: 'Conexões', path: '/app/connections', icon: Link2 },
    { label: 'Configurações', path: '/app/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#050B14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* HUD Header */}
      <header className="border-b border-cyan-500/20 glass-panel sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & System Title */}
          <Link to="/app" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-400/40 flex items-center justify-center group-hover:border-cyan-400 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider text-cyan-300 group-hover:text-cyan-200 transition-colors glow-cyan">
                J.A.R.V.I.S.
              </span>
              <span className="block text-[10px] font-mono text-cyan-400/60 uppercase tracking-widest">
                SYSTEM OPERATIONAL
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                      : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-900/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : ''}`} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200">{user?.name}</span>
              <span className="text-[10px] font-mono text-cyan-400/70">
                {user?.organizations?.[0]?.organization?.name || 'Multi-tenant'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <button
                onClick={handleLogout}
                title="Sair do Sistema"
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {children}
      </main>

      {/* Futuristic HUD Footer */}
      <footer className="border-t border-cyan-500/10 py-3 text-center text-xs font-mono text-cyan-500/40 flex justify-between px-6">
        <span className="flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-cyan-400/60" /> PROTECTED BY MULTI-TENANT ISOLATION
        </span>
        <span className="flex items-center gap-1">
          <Wifi className="w-3.5 h-3.5 text-emerald-400/60" /> VOICE STREAM ONLINE
        </span>
      </footer>
    </div>
  );
};
