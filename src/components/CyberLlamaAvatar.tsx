import React, { useState, useEffect } from 'react';
import { Mic, Volume2, Cpu, Radio } from 'lucide-react';
import { soundManager } from '../lib/sound';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface CyberLlamaAvatarProps {
  state: VoiceState;
  onClick: () => void;
  hasPermission: boolean;
}

export const CyberLlamaAvatar: React.FC<CyberLlamaAvatarProps> = ({ state, onClick }) => {
  const [shockwave, setShockwave] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, scale: 1 });

  // Play appropriate sound effect on state changes
  useEffect(() => {
    if (state === 'listening') {
      soundManager.playActivationSound();
    } else if (state === 'processing') {
      soundManager.playProcessingSound();
    } else if (state === 'speaking') {
      soundManager.playSpeakingSound();
    }
  }, [state]);

  // Mouse movement parallax tracking effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const rotY = ((clientX / innerWidth) - 0.5) * 32; // -16deg to +16deg
      const rotX = ((clientY / innerHeight) - 0.5) * -32; // -16deg to +16deg
      setTilt({ rotateX: rotX, rotateY: rotY, scale: 1.02 });
    };

    const handleMouseLeave = () => {
      setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

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
        return 'J.A.R.V.I.S. TRANSMITINDO ÁUDIO...';
      case 'idle':
      default:
        return 'TOQUE NO AVATAR CYBER LLAMA PARA INICIAR VOZ';
    }
  };

  const getGlowEffect = () => {
    switch (state) {
      case 'listening':
        return 'shadow-[0_0_100px_#FF007A] border-[#FF007A] scale-105';
      case 'processing':
        return 'shadow-[0_0_100px_#F59E0B] border-amber-400 animate-pulse';
      case 'speaking':
        return 'shadow-[0_0_100px_#00F0FF] border-[#00F0FF] animate-pulse';
      case 'idle':
      default:
        return 'shadow-[0_0_60px_rgba(255,0,122,0.45)] border-pink-500/50 hover:shadow-[0_0_95px_rgba(255,0,122,0.85)]';
    }
  };

  // Generate 24 radial audio equalizer bars radiating around the avatar
  const radialBars = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i / 24) * 360;
    const delay = (i % 6) * 0.15;
    return { angle, delay };
  });

  return (
    <div className="flex flex-col items-center justify-center my-2 sm:my-4 relative select-none">
      {/* Shockwave Wavefront */}
      {shockwave && (
        <div className="absolute w-96 h-96 sm:w-[450px] sm:h-[450px] rounded-full border-2 border-[#FF007A] animate-ping pointer-events-none opacity-80 z-0" />
      )}

      {/* Holographic Reactive Container with 3D Parallax */}
      <div
        className="relative group flex items-center justify-center z-10 transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
        }}
      >
        {/* RADIAL AUDIO EQUALIZER SPECTRUM BARS (PLAYING SOUND EFFECT AROUND LLAMA) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {radialBars.map((bar, idx) => (
            <div
              key={idx}
              className="absolute w-1 rounded-full origin-bottom transition-all duration-300"
              style={{
                transform: `rotate(${bar.angle}deg) translateY(-145px)`,
                height: state !== 'idle' ? '28px' : '8px',
                background: idx % 2 === 0 ? 'linear-gradient(to top, #FF007A, #00F0FF)' : 'linear-gradient(to top, #00F0FF, #9D4EDD)',
                opacity: state !== 'idle' ? 0.9 : 0.4,
                animation: state !== 'idle' ? `wave 0.8s infinite ease-in-out ${bar.delay}s` : 'none',
              }}
            />
          ))}
        </div>

        {/* Outer Pulsing Sound Wave Ring */}
        <div
          className={`absolute rounded-full border-2 border-transparent bg-origin-border bg-clip-border w-72 h-72 sm:w-96 sm:h-96 md:w-[410px] md:h-[410px] -m-8 sm:-m-10 shadow-[0_0_50px_rgba(255,0,122,0.5)] ${
            state === 'speaking' || state === 'listening' ? 'animate-pulse scale-105' : 'animate-spinSlow'
          }`}
          style={{
            backgroundImage: 'linear-gradient(to right, #FF007A, #00F0FF, #9D4EDD, #FF007A)',
            animationDuration: '5s',
          }}
        />

        {/* Degree Compass Marks */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
          <div className="w-80 h-80 sm:w-[420px] sm:h-[420px] rounded-full border border-pink-500/30 flex items-center justify-center">
            <span className="absolute top-1 text-[9px] font-tech text-pink-400 font-bold">000°</span>
            <span className="absolute right-1 text-[9px] font-tech text-cyan-400 font-bold">090°</span>
            <span className="absolute bottom-1 text-[9px] font-tech text-pink-400 font-bold">180°</span>
            <span className="absolute left-1 text-[9px] font-tech text-cyan-400 font-bold">270°</span>
          </div>
        </div>

        {/* LARGER Cyber Llama Interactive Avatar Button */}
        <button
          onClick={handleClick}
          className={`relative z-10 w-64 h-64 sm:w-80 sm:h-80 md:w-[360px] md:h-[360px] rounded-full glass-panel border-4 transition-all duration-500 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${getGlowEffect()}`}
        >
          {/* Cyber Llama Base Image (Pristine Original High-Res Image) */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src="/cyber_llama_avatar.png"
              alt="Cyberpunk Llama Avatar"
              className="w-full h-full object-cover object-center transform transition-transform duration-300 group-hover:scale-105"
            />

            {/* State Icon Badge Overlay */}
            <div className="absolute bottom-3 right-3 bg-slate-950/80 p-2.5 rounded-full border border-pink-500/60 shadow-[0_0_15px_#FF007A] z-30">
              {state === 'listening' && <Mic className="w-6 h-6 text-[#FF007A] animate-bounce" />}
              {state === 'processing' && <Cpu className="w-6 h-6 text-amber-400 animate-pulse" />}
              {state === 'speaking' && <Volume2 className="w-6 h-6 text-[#00F0FF] animate-pulse" />}
              {state === 'idle' && <Mic className="w-6 h-6 text-cyan-300" />}
            </div>
          </div>
        </button>
      </div>

      {/* Subtitle Telemetry Indicator */}
      <div className="mt-4 sm:mt-6 text-center space-y-1 z-10">
        <p className="text-[11px] sm:text-xs font-tech text-cyan-300/90 flex items-center justify-center gap-2 bg-slate-950/90 px-5 py-1.5 rounded-full border border-pink-500/40 shadow-[0_0_15px_rgba(255,0,122,0.3)]">
          <Radio className="w-3.5 h-3.5 text-[#FF007A] animate-pulse" />
          <span>{getStatusText()}</span>
        </p>
      </div>
    </div>
  );
};
