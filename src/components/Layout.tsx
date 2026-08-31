import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HudBackground } from './HudBackground';
import { JarvisBootOverlay } from './JarvisBootOverlay';
import { soundManager } from '../lib/sound';
import { Bot, Link2, Settings, LogOut, Shield, Wifi, Volume2, VolumeX, RefreshCw } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showBoot, setShowBoot] = useState(false);
  const [soundOn, setSoundOn] = useState(soundManager.soundEnabled);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSound = () => {
    soundManager.soundEnabled = !soundOn;
    setSoundOn(!soundOn);
    if (!soundOn) {
      soundManager.playClickSound();
    }
  };

  const triggerReboot = () => {
    setShowBoot(true);
  };

  const navItems = [
    { label: 'Assistente', path: '/app', icon: Bot },
    { label: 'Conexões', path: '/app/connections', icon: Link2 },
    { label: 'Configurações', path: '/app/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative pb-16 sm:pb-0">
      {/* Sci-Fi Canvas Background Grid */}
      <HudBackground />

      {/* Boot Overlay Sequence */}
      {showBoot && <JarvisBootOverlay onComplete={() => setShowBoot(false)} />}

      {/* HUD Header */}
      <header className="border-b border-cyan-500/20 glass-panel sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & System Title */}
          <Link to="/app" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-400/40 flex items-center justify-center group-hover:border-cyan-400 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="font-orbitron font-extrabold text-base sm:text-lg tracking-wider text-cyan-300 group-hover:text-cyan-200 transition-colors glow-cyan">
                J.A.R.V.I.S.
              </span>
              <span className="block text-[9px] font-tech text-cyan-400/60 uppercase tracking-widest">
                MARK 85 OPERATIONAL
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden sm:flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => soundManager.playClickSound()}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-rajdhani font-bold transition-all ${
                    isActive
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                      : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-900/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile, Sound Toggle & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Reboot Boot Sequence Button */}
            <button
              onClick={triggerReboot}
              title="Reiniciar Boot Sequence"
              className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 hover:text-cyan-200 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Sound FX Toggle */}
            <button
              onClick={toggleSound}
              title={soundOn ? 'Desativar Sons Sci-Fi' : 'Ativar Sons Sci-Fi'}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                soundOn
                  ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200">{user?.name}</span>
              <span className="text-[10px] font-tech text-cyan-400/70">
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
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 flex flex-col relative z-10">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (PWA Optimization for iOS/Android) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-cyan-500/30 px-4 py-2 flex justify-around items-center bg-slate-950/95 backdrop-blur-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => soundManager.playClickSound()}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-300 font-bold glow-cyan'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 animate-pulse' : ''}`} />
              <span className="text-[10px] font-rajdhani uppercase">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Futuristic HUD Footer */}
      <footer className="hidden sm:flex border-t border-cyan-500/10 py-3 text-center text-xs font-tech text-cyan-500/40 justify-between px-6 relative z-10 bg-[#030712]/80 backdrop-blur-md">
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
