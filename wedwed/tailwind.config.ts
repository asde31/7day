import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Бренд Uzlav: кремово-золотая + emerald
        cream: { DEFAULT: '#faf6ee', deep: '#f0e6d2' },
        gold: { DEFAULT: '#c9a24b', dk: '#a9822f', light: '#e3c273' },
        emerald2: '#2f5d50',
        ink: '#241e14',
        muted: '#6b6152',
        // сохраняем blush для существующей админки
        blush: {
          50: '#fdf6f7',
          100: '#fbeaee',
          200: '#f6d3dc',
          300: '#eeb0c1',
          400: '#e283a0',
          500: '#d15b83',
          600: '#bd3f6c',
          700: '#9e2f57',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      borderRadius: {
        xl2: '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
};

export default config;
