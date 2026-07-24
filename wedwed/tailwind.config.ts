import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Мягкая свадебная палитра (blush / rose / champagne)
        blush: {
          50: '#fdf6f7',
          100: '#fbeaee',
          200: '#f6d3dc',
          300: '#eeb0c1',
          400: '#e283a0',
          500: '#d15b83',
          600: '#bd3f6c',
          700: '#9e2f57',
          800: '#842a4a',
          900: '#712742',
        },
        champagne: '#f7efe2',
        ink: '#2b2430',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 4px 24px -8px rgba(113, 39, 66, 0.18)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
