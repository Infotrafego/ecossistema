import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta oficial Infotráfego
        navy: { DEFAULT: '#1A3D70', soft: '#2D5A95' },
        alicerce: { DEFAULT: '#031D31' },
        gray: { DEFAULT: '#939899' },
        ash: { DEFAULT: '#C7D2D7' },
        ink: { DEFAULT: '#10131A' },
        // Cores semânticas
        success: { DEFAULT: '#16A34A', bg: '#D1FAE5' },
        warn: { DEFAULT: '#DC2626', bg: '#FEE2E2' },
        attention: { DEFAULT: '#D97706', bg: '#FEF3C7' },
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'Inter', 'system-ui'],
      },
      letterSpacing: {
        tight: '-0.005em',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
