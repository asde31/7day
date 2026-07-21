/**
 * 7day design tokens. Dark-first palette — the app is used mostly at dawn and
 * at night, so a dark surface is the default. A light variant is provided for
 * `userInterfaceStyle: automatic`.
 */

export const palette = {
  // Brand
  cyan: '#22D3EE',
  cyanDark: '#0891B2',
  indigo: '#6366F1',
  violet: '#8B5CF6',

  // Semantic
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  water: '#38BDF8',
  breath: '#A78BFA',

  // Neutrals
  ink900: '#0B1120',
  ink800: '#111827',
  ink700: '#1F2937',
  ink600: '#374151',
  ink400: '#9CA3AF',
  ink300: '#D1D5DB',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export interface Theme {
  mode: 'light' | 'dark';
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  water: string;
  breath: string;
}

export const darkTheme: Theme = {
  mode: 'dark',
  bg: palette.ink900,
  surface: palette.ink800,
  surfaceAlt: palette.ink700,
  border: palette.ink600,
  text: palette.white,
  textMuted: palette.ink400,
  primary: palette.cyan,
  accent: palette.indigo,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  water: palette.water,
  breath: palette.breath,
};

export const lightTheme: Theme = {
  mode: 'light',
  bg: '#F8FAFC',
  surface: palette.white,
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  text: palette.ink900,
  textMuted: '#64748B',
  primary: palette.cyanDark,
  accent: palette.indigo,
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  water: '#0284C7',
  breath: palette.violet,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 48, fontWeight: '700' as const, letterSpacing: -1 },
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '600' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  label: { fontSize: 14, fontWeight: '500' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
};
