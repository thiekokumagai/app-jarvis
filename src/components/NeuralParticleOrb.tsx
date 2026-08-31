import React, { useRef, useEffect } from 'react';
import { VoiceState } from './CyberLlamaAvatar';

interface NeuralParticleOrbProps {
  state: VoiceState;
  onClick?: () => void;
}

export const NeuralParticleOrb: React.FC<NeuralParticleOrbProps> = ({ state, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 360);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle class for 3D sphere simulation
    const particleCount = 220;
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      baseX: number;
      baseY: number;
      baseZ: number;
      size: number;
      color: string;
    }> = [];

    const radius = Math.min(width, height) * 0.28;

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const px = radius * Math.sin(phi) * Math.cos(theta);
      const py = radius * Math.sin(phi) * Math.sin(theta);
      const pz = radius * Math.cos(phi);

      particles.push({
        x: px,
        y: py,
        z: pz,
        baseX: px,
        baseY: py,
        baseZ: pz,
        size: Math.random() * 1.8 + 0.8,
        color: Math.random() > 0.3 ? '#00F0FF' : '#3B82F6',
      });
    }

    let angleX = 0.003;
    let angleY = 0.005;
    let livePulseEnergy = 0;

    const handleSpeechPulse = (e: any) => {
      livePulseEnergy = e.detail?.intensity || 1.2;
    };

    window.addEventListener('jarvis-speech-pulse', handleSpeechPulse);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      livePulseEnergy *= 0.88; // Decay speech pulse energy smoothly

      // Adjust rotation speed & scale based on voice state
      let rotSpeedMultiplier = 1;
      let pulseScale = 1;

      if (state === 'listening') {
        rotSpeedMultiplier = 2.2;
        pulseScale = 1.12 + Math.sin(Date.now() * 0.008) * 0.08;
      } else if (state === 'speaking') {
        rotSpeedMultiplier = 3.0 + livePulseEnergy * 1.8;
        pulseScale = 1.15 + Math.sin(Date.now() * 0.015) * 0.08 + livePulseEnergy * 0.18;
      } else if (state === 'processing') {
        rotSpeedMultiplier = 1.8;
        pulseScale = 1.05 + Math.sin(Date.now() * 0.01) * 0.05;
      }

      // Draw central glowing core light
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        5,
        centerX,
        centerY,
        radius * 0.85 * pulseScale
      );

      if (state === 'speaking') {
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
        gradient.addColorStop(0.4, 'rgba(59, 130, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(3, 7, 18, 0)');
      } else if (state === 'listening') {
        gradient.addColorStop(0, 'rgba(224, 36, 175, 0.7)');
        gradient.addColorStop(0.5, 'rgba(0, 240, 255, 0.25)');
        gradient.addColorStop(1, 'rgba(3, 7, 18, 0)');
      } else if (state === 'processing') {
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.7)');
        gradient.addColorStop(0.5, 'rgba(217, 119, 6, 0.2)');
        gradient.addColorStop(1, 'rgba(3, 7, 18, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
        gradient.addColorStop(0.6, 'rgba(30, 58, 138, 0.15)');
        gradient.addColorStop(1, 'rgba(3, 7, 18, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.3 * pulseScale, 0, Math.PI * 2);
      ctx.fill();

      // Rotate and project 3D particles
      const sinX = Math.sin(angleX * rotSpeedMultiplier);
      const cosX = Math.cos(angleX * rotSpeedMultiplier);
      const sinY = Math.sin(angleY * rotSpeedMultiplier);
      const cosY = Math.cos(angleY * rotSpeedMultiplier);

      particles.forEach((p) => {
        // Rotate Y
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // Rotate X
        let y1 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        p.x = x1;
        p.y = y1;
        p.z = z2;

        // Perspective Projection
        const fov = 320;
        const scale = fov / (fov + z2);
        const projX = centerX + x1 * scale * pulseScale;
        const projY = centerY + y1 * scale * pulseScale;

        const alpha = Math.max(0.1, Math.min(1, (z2 + radius) / (2 * radius)));

        ctx.beginPath();
        ctx.arc(projX, projY, p.size * scale, 0, Math.PI * 2);

        if (state === 'listening') {
          ctx.fillStyle = Math.random() > 0.5 ? '#E024AF' : '#00F0FF';
        } else if (state === 'speaking') {
          ctx.fillStyle = '#00F0FF';
        } else if (state === 'processing') {
          ctx.fillStyle = '#F59E0B';
        } else {
          ctx.fillStyle = p.color;
        }

        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('jarvis-speech-pulse', handleSpeechPulse);
    };
  }, [state]);

  return (
    <div
      onClick={onClick}
      className="relative w-full h-72 sm:h-80 md:h-96 flex items-center justify-center cursor-pointer select-none"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
