import React from 'react';
import { VoiceState } from './CyberLlamaAvatar';
import { Cpu, ShieldCheck, Activity, Zap, CheckCircle2, Type, Languages, Search, Sparkles } from 'lucide-react';

interface TelemetryProps {
  state: VoiceState;
}

export const LeftTelemetryPanel: React.FC<TelemetryProps> = ({ state }) => {
  const isAudioActive = state === 'listening' || state === 'speaking' || state === 'processing';
  const [pulseBoost, setPulseBoost] = React.useState(1);

  React.useEffect(() => {
    const handlePulse = (e: any) => {
      setPulseBoost(e.detail?.intensity || 1.3);
      setTimeout(() => setPulseBoost(1), 120);
    };

    window.addEventListener('jarvis-speech-pulse', handlePulse);
    return () => window.removeEventListener('jarvis-speech-pulse', handlePulse);
  }, []);

  return (
    <div className="space-y-4 font-tech text-xs select-none">
      {/* ANÁLISE DE VOZ */}
      <div className="glass-panel hud-frame rounded-2xl p-3.5 border border-cyan-500/30 bg-slate-950/80 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
        <span className="text-[10px] font-orbitron font-bold tracking-widest text-cyan-400/90 uppercase block mb-2">
          ANÁLISE DE VOZ
        </span>
        <div className="flex items-end justify-between h-10 px-1 gap-1">
          {Array.from({ length: 24 }).map((_, idx) => {
            const h = isAudioActive
              ? Math.floor((Math.sin((idx + Date.now() * 0.008) * 0.8) * 12 + 18) * pulseBoost)
              : Math.floor(Math.sin(idx * 0.5) * 3 + 6);
            return (
              <span
                key={idx}
                className="w-1 bg-gradient-to-t from-cyan-600 via-sky-400 to-cyan-200 rounded-full transition-all duration-150 shadow-[0_0_6px_#00F0FF]"
                style={{ height: `${Math.min(38, Math.max(4, h))}px` }}
              />
            );
          })}
        </div>
      </div>

      {/* RESPOSTA DE FREQUÊNCIA */}
      <div className="glass-panel hud-frame rounded-2xl p-3.5 border border-cyan-500/30 bg-slate-950/80 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
        <span className="text-[10px] font-orbitron font-bold tracking-widest text-cyan-400/90 uppercase block mb-2">
          RESPOSTA DE FREQUÊNCIA
        </span>
        <div className="flex items-end justify-between h-12 px-1 gap-1 border-b border-cyan-500/20 pb-1">
          {[12, 24, 38, 20, 45, 30, 18, 40, 28, 15, 35, 22, 10, 32, 26, 14].map((height, idx) => (
            <span
              key={idx}
              className="w-1.5 bg-cyan-400/80 rounded-t transition-all duration-150 shadow-[0_0_8px_#00F0FF]"
              style={{
                height: isAudioActive ? `${Math.min(44, height * 0.9 * pulseBoost)}px` : `${height * 0.4}px`,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-cyan-400/50 mt-1 px-1 font-mono">
          <span>20</span>
          <span>200</span>
          <span>2K</span>
          <span>20K</span>
        </div>
      </div>

      {/* CONFIANÇA */}
      <div className="glass-panel hud-frame rounded-2xl p-3.5 border border-cyan-500/30 bg-slate-950/80 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
        <div className="flex justify-between text-[10px] font-orbitron font-bold text-cyan-400/90 uppercase mb-1.5">
          <span>CONFIANÇA</span>
          <span className="text-cyan-200 glow-cyan">94%</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2 border border-cyan-500/30 overflow-hidden p-0.5">
          <div className="bg-gradient-to-r from-cyan-500 to-sky-300 h-full rounded-full w-[94%] shadow-[0_0_10px_#00F0FF]" />
        </div>
      </div>

      {/* STATUS DO SISTEMA */}
      <div className="glass-panel hud-frame rounded-2xl p-3.5 border border-cyan-500/30 bg-slate-950/80 space-y-2 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
        <span className="text-[10px] font-orbitron font-bold tracking-widest text-cyan-400/90 uppercase block mb-1">
          STATUS DO SISTEMA
        </span>
        {[
          { label: 'Núcleo', status: 'ONLINE' },
          { label: 'Reconhecimento de voz', status: 'ATIVO' },
          { label: 'Motor NLP', status: 'ONLINE' },
          { label: 'Machine Learning', status: 'ATIVO' },
          { label: 'Sincronização', status: 'ONLINE' },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{item.label}</span>
            </span>
            <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {item.status}
            </span>
          </div>
        ))}
      </div>

      {/* RECURSOS */}
      <div className="glass-panel hud-frame rounded-2xl p-3.5 border border-cyan-500/30 bg-slate-950/80 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
        <span className="text-[10px] font-orbitron font-bold tracking-widest text-cyan-400/90 uppercase block mb-2">
          RECURSOS
        </span>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { name: 'CPU', val: 31 },
            { name: 'RAM', val: 77 },
            { name: 'NET', val: 21 },
            { name: 'DISK', val: 45 },
          ].map((r, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="22" cy="22" r="18" stroke="#1E293B" strokeWidth="3" fill="transparent" />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    stroke="#00F0FF"
                    strokeWidth="3"
                    strokeDasharray={113}
                    strokeDashoffset={113 - (113 * r.val) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-[9px] font-bold text-cyan-200">{r.val}%</span>
              </div>
              <span className="text-[9px] font-bold text-cyan-400/70 mt-1 uppercase">{r.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const RightTelemetryPanel: React.FC<TelemetryProps> = ({ state }) => {
  return (
    <div className="space-y-4 font-tech text-xs select-none">
      {/* INSIGHTS DE DADOS */}
      <div className="glass-panel hud-frame rounded-2xl p-3.5 border border-cyan-500/30 bg-slate-950/80 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
        <span className="text-[10px] font-orbitron font-bold tracking-widest text-cyan-400/90 uppercase block mb-2">
          INSIGHTS DE DADOS
        </span>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="#1E293B" strokeWidth="6" fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#00F0FF"
                strokeWidth="6"
                strokeDasharray={163}
                strokeDashoffset={163 - (163 * 78) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-bold text-cyan-200 glow-cyan">78%</span>
          </div>
          <div className="space-y-1 text-[10px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Voz: 58%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Contexto: 25%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Usuário: 10%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E024AF]" />
              <span>Sistema: 7%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS (TELEMETRIA SPARKLINE) */}
      <div className="glass-panel hud-frame rounded-2xl p-3.5 border border-cyan-500/30 bg-slate-950/80 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
        <div className="flex justify-between text-[10px] font-orbitron font-bold text-cyan-400/90 uppercase mb-2">
          <span>ANALYTICS</span>
          <span className="text-[9px] text-cyan-500/60 font-mono">últimos 60s</span>
        </div>
        <div className="h-14 w-full flex items-center">
          <svg className="w-full h-full overflow-visible">
            <path
              d="M 0 30 Q 30 10, 60 35 T 120 15 T 180 40 T 240 20 T 300 30"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="2"
              className="shadow-[0_0_10px_#00F0FF]"
            />
            <path
              d="M 0 30 Q 30 10, 60 35 T 120 15 T 180 40 T 240 20 T 300 30 L 300 50 L 0 50 Z"
              fill="rgba(0,240,255,0.15)"
            />
          </svg>
        </div>
      </div>

      {/* MÓDULOS ATIVOS */}
      <div className="glass-panel hud-frame rounded-2xl p-3.5 border border-cyan-500/30 bg-slate-950/80 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
        <span className="text-[10px] font-orbitron font-bold tracking-widest text-cyan-400/90 uppercase block mb-2">
          MÓDULOS ATIVOS
        </span>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { icon: Type, name: 'Fala->Texto' },
            { icon: Languages, name: 'Linguagem' },
            { icon: Search, name: 'Busca' },
            { icon: Sparkles, name: 'Aprendizado' },
          ].map((m, idx) => (
            <div
              key={idx}
              className="p-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex flex-col items-center gap-1 hover:border-cyan-300 transition-colors"
            >
              <m.icon className="w-4 h-4 text-cyan-300" />
              <span className="text-[8px] font-bold text-slate-300 truncate w-full">{m.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CONEXÃO */}
      <div className="glass-panel hud-frame rounded-2xl p-3.5 border border-cyan-500/30 bg-slate-950/80 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
        <span className="text-[10px] font-orbitron font-bold tracking-widest text-cyan-400/90 uppercase block mb-2">
          CONEXÃO NEURAL
        </span>
        <div className="h-10 w-full flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2">
          {/* Constellation Nodes */}
          <div className="flex items-center gap-4 w-full justify-around">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF] animate-ping" />
            <span className="w-2 h-2 rounded-full bg-sky-400 opacity-60" />
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818CF8]" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 opacity-60" />
          </div>
        </div>
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-emerald-400 font-bold uppercase">SERVIDOR ÓTIMO</span>
          <span className="text-cyan-300">LATÊNCIA 24ms</span>
        </div>
      </div>
    </div>
  );
};
