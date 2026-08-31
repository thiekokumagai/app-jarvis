import React, { useState, useEffect } from 'react';
import { Bot, Cpu, Shield, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { soundManager } from '../lib/sound';

interface JarvisBootOverlayProps {
  onComplete: () => void;
  userName?: string;
}

export const JarvisBootOverlay: React.FC<JarvisBootOverlayProps> = ({ onComplete, userName }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const formattedName = userName ? userName.trim().split(' ')[0].toUpperCase() : '';
  const welcomeText = formattedName
    ? `SISTEMA OPERACIONAL. SEJA BEM-VINDO, ${formattedName}.`
    : 'SISTEMA OPERACIONAL. SEJA BEM-VINDO.';

  const bootLogs = [
    'INICIALIZANDO ARQUITETURA CORE J.A.R.V.I.S....',
    'VERIFICANDO BIOMETRIA E ISOLAMENTO MULTI-TENANT...',
    'CONFIGURANDO CRIPTOGRAFIA AES-256 DE TOKENS...',
    'ESTABELECENDO ENGINE DE TOOL CALLING E VOZ...',
    welcomeText,
  ];

  useEffect(() => {
    // Play boot sound effect
    soundManager.playBootSound();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFading(true);
            setTimeout(onComplete, 800);
          }, 400);
          return 100;
        }
        const next = prev + 5;
        const stepIdx = Math.min(Math.floor((next / 100) * bootLogs.length), bootLogs.length - 1);
        setCurrentStep(stepIdx);
        return next;
      });
    }, 90);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#030712] flex flex-col items-center justify-center transition-opacity duration-700 select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Sci-Fi Holographic Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff08_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent animate-pulse" />

      {/* Central Holographic Core Visualizer */}
      <div className="relative flex flex-col items-center z-10 max-w-lg w-full px-6">
        {/* Arc Reactor Spinning Rings */}
        <div className="relative w-44 h-44 flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-[#00F0FF]/30 border-t-[#00F0FF] animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-2 rounded-full border border-sky-400/20 border-b-cyan-400 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          <div className="absolute inset-6 rounded-full border-2 border-dashed border-cyan-500/40 animate-pulse" />

          {/* Central Reactor Core */}
          <div className="w-24 h-24 rounded-full bg-cyan-950/80 border-2 border-[#00F0FF] flex flex-col items-center justify-center shadow-[0_0_50px_#00F0FF] relative overflow-hidden">
            <Zap className="w-10 h-10 text-[#00F0FF] animate-bounce" />
            <span className="text-[11px] font-mono text-cyan-200 font-bold tracking-widest mt-1">
              {progress}%
            </span>
          </div>
        </div>

        {/* System Title */}
        <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-cyan-500 glow-cyan mb-2">
          J.A.R.V.I.S. MARK 85
        </h1>
        <p className="text-xs font-mono text-cyan-400/70 uppercase tracking-widest flex items-center gap-1.5 mb-8">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          SYSTEM BOOT SEQUENCE IN PROGRESS
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 border border-cyan-500/30 overflow-hidden mb-6 p-0.5 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <div
            className="bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-300 h-full rounded-full transition-all duration-150 shadow-[0_0_12px_#00F0FF]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Boot Telemetry Logs */}
        <div className="w-full glass-panel rounded-xl p-4 border border-cyan-500/30 text-left font-mono text-xs text-cyan-300/90 space-y-2 bg-slate-950/80">
          <div className="flex items-center justify-between text-[10px] text-cyan-400/50 border-b border-cyan-500/20 pb-1.5 mb-2">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400" /> KERNEL DIAGNOSTIC
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> ONLINE
            </span>
          </div>

          <div className="flex items-center gap-2 text-cyan-200">
            <span className="text-cyan-500">&gt;</span>
            <span className="truncate">{bootLogs[currentStep]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
