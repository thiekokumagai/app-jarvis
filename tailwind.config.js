/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: '#050B14',
          card: '#0B1528',
          border: '#1E3A5F',
          cyan: '#00F0FF',
          blue: '#0A84FF',
          accent: '#38BDF8',
          glow: 'rgba(0, 240, 255, 0.4)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        arc: '0 0 40px rgba(0, 240, 255, 0.6), inset 0 0 20px rgba(0, 240, 255, 0.4)',
        'arc-active': '0 0 60px rgba(0, 240, 255, 0.9), inset 0 0 30px rgba(0, 240, 255, 0.7)',
        glow: '0 0 20px rgba(0, 240, 255, 0.3)',
      },
      animation: {
        pulseGlow: 'pulseGlow 2s infinite ease-in-out',
        spinSlow: 'spin 12s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
