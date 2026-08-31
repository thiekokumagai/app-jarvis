/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: '#030712',
          card: '#0B1528',
          border: '#1E3A5F',
          cyan: '#00F0FF',
          gold: '#FFD700',
          blue: '#0A84FF',
          accent: '#38BDF8',
          glow: 'rgba(0, 240, 255, 0.4)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        tech: ['"Share Tech Mono"', 'monospace'],
      },
      boxShadow: {
        arc: '0 0 50px rgba(0, 240, 255, 0.7), inset 0 0 30px rgba(0, 240, 255, 0.5)',
        'arc-gold': '0 0 50px rgba(255, 215, 0, 0.7), inset 0 0 30px rgba(255, 215, 0, 0.5)',
        'arc-active': '0 0 80px rgba(0, 240, 255, 0.95), inset 0 0 40px rgba(0, 240, 255, 0.8)',
        glow: '0 0 25px rgba(0, 240, 255, 0.35)',
        'hud-card': '0 0 30px rgba(0, 240, 255, 0.15), inset 0 0 15px rgba(0, 240, 255, 0.05)',
      },
      animation: {
        pulseGlow: 'pulseGlow 2s infinite ease-in-out',
        spinSlow: 'spin 16s linear infinite',
        spinReverse: 'spinReverse 20s linear infinite',
        hudScan: 'hudScan 4s infinite ease-in-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        spinReverse: {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        hudScan: {
          '0%, 100%': { transform: 'translateY(0%)', opacity: '0.3' },
          '50%': { transform: 'translateY(100%)', opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};
