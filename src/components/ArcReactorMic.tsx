import React from 'react';
import { Mic, MicOff, Volume2, Cpu, Sparkles } from 'lucide-react';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface ArcReactorMicProps {
  state: VoiceState;
  onClick: () => void;
  hasPermission: boolean;
}

export const ArcReactorMic: React.FC<ArcReactorMicProps> = ({ state, onClick, hasPermission }) => {
  const getStatusText = () => {
    switch (state) {
      case 'listening':
        return 'Ouvindo você... Fale seu comando';
      case 'processing':
        return 'Processando solicitação...';
      case 'speaking':
        return 'J.A.R.V.I.S. Respondendo...';
      case 'idle':
      default:
        return 'Clique no microfone para falar';
    }
  };

  const getBorderColor = () => {
    switch (state) {
      case 'listening':
        return 'border-[#00F0FF] shadow-[0_0_50px_#00F0FF] scale-105';
      case 'processing':
        return 'border-amber-400 shadow-[0_0_50px_#F59E0B] animate-spin';
      case 'speaking':
        return 'border-emerald-400 shadow-[0_0_50px_#10B981] animate-pulse';
      case 'idle':
      default:
        return 'border-sky-500/40 hover:border-[#00F0FF] shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:shadow-[0_0_45px_rgba(0,240,255,0.6)]';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center my-6">
      {/* Outer Glow Ring */}
      <div className="relative group flex items-center justify-center">
        {/* Animated Background Arc Rings */}
        <div className="absolute inset-0 rounded-full border border-[#00F0FF]/20 animate-spinSlow w-64 h-64 -m-6" />
        <div className="absolute inset-0 rounded-full border border-sky-400/10 w-72 h-72 -m-10" />

        {/* Main Arc Button */}
        <button
          onClick={onClick}
          className={`relative z-10 w-52 h-52 rounded-full glass-panel border-4 transition-all duration-500 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${getBorderColor()}`}
        >
          {/* Inner Arc Reactor Grid Pattern */}
          <div className="absolute inset-2 rounded-full border border-cyan-500/20 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border border-cyan-400/30 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border border-cyan-300/40 flex items-center justify-center bg-cyan-950/30" />
            </div>
          </div>

          {/* Central Icon depending on State */}
          <div className="relative z-20 flex flex-col items-center">
            {state === 'listening' && (
              <div className="relative flex items-center justify-center">
                <Mic className="w-16 h-16 text-[#00F0FF] animate-bounce" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
                </span>
              </div>
            )}

            {state === 'processing' && (
              <Cpu className="w-16 h-16 text-amber-400 animate-pulse" />
            )}

            {state === 'speaking' && (
              <Volume2 className="w-16 h-16 text-emerald-400 animate-pulse" />
            )}

            {state === 'idle' && (
              <Mic className="w-16 h-16 text-cyan-300 group-hover:scale-110 transition-transform duration-300" />
            )}

            {/* Visualizer Waveforms when listening or speaking */}
            {(state === 'listening' || state === 'speaking') && (
              <div className="flex gap-1 items-end h-6 mt-3">
                <span className="w-1 bg-[#00F0FF] animate-wave h-4 rounded-full" style={{ animationDelay: '0.1s' }} />
                <span className="w-1 bg-[#00F0FF] animate-wave h-6 rounded-full" style={{ animationDelay: '0.3s' }} />
                <span className="w-1 bg-[#00F0FF] animate-wave h-3 rounded-full" style={{ animationDelay: '0.2s' }} />
                <span className="w-1 bg-[#00F0FF] animate-wave h-5 rounded-full" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>
        </button>
      </div>

      {/* State Text & Subtitle */}
      <div className="mt-8 text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-400 glow-cyan">
          Como posso ajudar?
        </h2>
        <p className="text-sm text-cyan-200/70 font-mono flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          {getStatusText()}
        </p>
      </div>
    </div>
  );
};
