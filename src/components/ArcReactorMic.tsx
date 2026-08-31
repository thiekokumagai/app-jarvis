import React, { useState, useEffect } from 'react';
import { Mic, Volume2, Cpu, Radio, Sparkles } from 'lucide-react';
import { soundManager } from '../lib/sound';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface ArcReactorMicProps {
  state: VoiceState;
  onClick: () => void;
  hasPermission: boolean;
}

export const ArcReactorMic: React.FC<ArcReactorMicProps> = ({ state, onClick }) => {
  const [shockwave, setShockwave] = useState(false);

  useEffect(() => {
    if (state === 'listening') {
      soundManager.playActivationSound();
    } else if (state === 'processing') {
      soundManager.playProcessingSound();
    } else if (state === 'speaking') {
      soundManager.playSpeakingSound();
    }
  }, [state]);

  const handleClick = () => {
    setShockwave(true);
    setTimeout(() => setShockwave(false), 900);
    onClick();
  };

  const getStatusText = () => {
    switch (state) {
      case 'listening':
        return 'RECEPTOR NEURAL ATIVO: FALE SEU COMANDO';
      case 'processing':
        return 'PROCESSANDO ALGORITMO & TOOL CALLING...';
      case 'speaking':
        return 'SINTETIZANDO VOZ J.A.R.V.I.S....';
      case 'idle':
      default:
        return 'TOQUE NO NÚCLEO PARA INICIAR VOZ';
    }
  };

  const getBorderGlow = () => {
    switch (state) {
      case 'listening':
        return 'border-[#E024AF] shadow-[0_0_90px_#E024AF] scale-105 ring-4 ring-pink-500/50';
      case 'processing':
        return 'border-amber-400 shadow-[0_0_90px_#F59E0B] animate-spin ring-4 ring-amber-400/50';
      case 'speaking':
        return 'border-[#00F0FF] shadow-[0_0_90px_#00F0FF] animate-pulse ring-4 ring-cyan-400/50';
      case 'idle':
      default:
        return 'border-cyan-500/50 hover:border-[#E024AF] shadow-[0_0_45px_rgba(224,36,175,0.4)] hover:shadow-[0_0_75px_rgba(0,240,255,0.8)]';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center my-4 sm:my-6 relative select-none">
      {/* Shockwave Wavefront */}
      {shockwave && (
        <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border-2 border-[#E024AF] animate-ping pointer-events-none opacity-80 z-0" />
      )}

      {/* Futuristic Header Arc Text (Inspired by J.A.R.V.I.S 01 Image) */}
      <div className="text-center mb-3 z-10">
        <span className="font-tech text-[10px] tracking-widest text-pink-400/80 uppercase block">
          VOICE OF ARTIFICIAL INTELLIGENCE
        </span>
        <h2 className="font-orbitron text-xl sm:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-purple-400 to-[#E024AF] glow-cyan">
          J.A.R.V.I.S. 01
        </h2>
      </div>

      {/* Holographic Reactive Audio Ring Container */}
      <div className="relative group flex items-center justify-center z-10">
        {/* Magenta & Cyan Gradient Audio Circle Ring */}
        <div
          className={`absolute rounded-full border-2 border-transparent bg-origin-border bg-clip-border w-64 h-64 sm:w-72 sm:h-72 -m-6 sm:-m-8 shadow-[0_0_30px_rgba(224,36,175,0.3)] ${
            state === 'listening' ? 'animate-spin' : 'animate-spinSlow'
          }`}
          style={{
            backgroundImage: 'linear-gradient(to right, #00F0FF, #E024AF, #9D4EDD, #00F0FF)',
            animationDuration: '6s',
          }}
        />

        {/* Outer Circular Audio Spectrum Tick Ring */}
        <div
          className="absolute rounded-full border border-dashed border-cyan-400/30 w-72 h-72 sm:w-80 sm:h-80 -m-10 sm:-m-12 animate-spinReverse"
          style={{ animationDuration: '16s' }}
        />

        {/* Degree Angle Indicators (000° 090° 180° 270°) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
          <div className="w-72 h-72 rounded-full border border-cyan-400/20 flex items-center justify-center">
            <span className="absolute top-1 text-[8px] font-tech text-cyan-300">000°</span>
            <span className="absolute right-1 text-[8px] font-tech text-cyan-300">090°</span>
            <span className="absolute bottom-1 text-[8px] font-tech text-cyan-300">180°</span>
            <span className="absolute left-1 text-[8px] font-tech text-cyan-300">270°</span>
          </div>
        </div>

        {/* Main Central Arc Core Button */}
        <button
          onClick={handleClick}
          className={`relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full glass-panel border-4 transition-all duration-500 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${getBorderGlow()}`}
        >
          {/* Inner Arc Sector Mesh */}
          <div className="absolute inset-3 rounded-full border border-pink-400/30 flex items-center justify-center">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-cyan-300/40 flex items-center justify-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-dashed border-pink-300/50 flex items-center justify-center bg-cyan-950/70 shadow-[inset_0_0_30px_#E024AF]" />
            </div>
          </div>

          {/* Central State Icon */}
          <div className="relative z-20 flex flex-col items-center">
            {state === 'listening' && (
              <div className="relative flex items-center justify-center">
                <Mic className="w-12 h-12 sm:w-16 sm:h-16 text-[#E024AF] animate-bounce" />
                <span className="absolute -top-2 -right-2 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-pink-500"></span>
                </span>
              </div>
            )}

            {state === 'processing' && (
              <Cpu className="w-12 h-12 sm:w-16 sm:h-16 text-amber-400 animate-pulse" />
            )}

            {state === 'speaking' && (
              <Volume2 className="w-12 h-12 sm:w-16 sm:h-16 text-[#00F0FF] animate-pulse" />
            )}

            {state === 'idle' && (
              <Mic className="w-12 h-12 sm:w-16 sm:h-16 text-cyan-300 group-hover:scale-110 transition-transform duration-300" />
            )}

            {/* Radial Audio Spectrum Waveform Bars */}
            <div className="flex gap-1 sm:gap-1.5 items-end h-6 sm:h-8 mt-2 sm:mt-3">
              <span
                className={`w-1 sm:w-1.5 bg-gradient-to-t from-[#00F0FF] to-[#E024AF] rounded-full transition-all ${
                  state !== 'idle' ? 'animate-wave h-6 sm:h-7' : 'h-2 bg-pink-500/40'
                }`}
                style={{ animationDelay: '0.1s' }}
              />
              <span
                className={`w-1 sm:w-1.5 bg-gradient-to-t from-[#00F0FF] to-[#E024AF] rounded-full transition-all ${
                  state !== 'idle' ? 'animate-wave h-7 sm:h-8' : 'h-3 bg-pink-500/40'
                }`}
                style={{ animationDelay: '0.3s' }}
              />
              <span
                className={`w-1 sm:w-1.5 bg-gradient-to-t from-[#00F0FF] to-[#E024AF] rounded-full transition-all ${
                  state !== 'idle' ? 'animate-wave h-4 sm:h-5' : 'h-1.5 bg-pink-500/40'
                }`}
                style={{ animationDelay: '0.2s' }}
              />
              <span
                className={`w-1 sm:w-1.5 bg-gradient-to-t from-[#00F0FF] to-[#E024AF] rounded-full transition-all ${
                  state !== 'idle' ? 'animate-wave h-6.5 sm:h-7.5' : 'h-2.5 bg-pink-500/40'
                }`}
                style={{ animationDelay: '0.4s' }}
              />
              <span
                className={`w-1 sm:w-1.5 bg-gradient-to-t from-[#00F0FF] to-[#E024AF] rounded-full transition-all ${
                  state !== 'idle' ? 'animate-wave h-5 sm:h-6' : 'h-2 bg-pink-500/40'
                }`}
                style={{ animationDelay: '0.15s' }}
              />
            </div>
          </div>
        </button>
      </div>

      {/* Subtitle Telemetry Indicator */}
      <div className="mt-6 sm:mt-8 text-center space-y-1.5 z-10">
        <p className="text-[11px] sm:text-xs font-tech text-cyan-300/90 flex items-center justify-center gap-2 bg-slate-950/80 px-4 py-1.5 rounded-full border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <Radio className="w-3.5 h-3.5 text-[#E024AF] animate-pulse" />
          <span>{getStatusText()}</span>
        </p>
      </div>
    </div>
  );
};
