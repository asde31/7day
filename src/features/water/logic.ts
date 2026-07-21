import type { Activity, Climate, WaterEntry, WaterProfile } from '@/types';

/**
 * Personal daily water goal (ml). Baseline of 35 ml/kg — a common practical
 * heuristic — adjusted for activity level and hot climate (relevant for the
 * Tashkent summer). Clamped to a sane range.
 */
export function dailyGoalMl(profile: WaterProfile): number {
  const base = profile.weightKg * 35;
  const activityFactor: Record<Activity, number> = { low: 1, moderate: 1.12, high: 1.25 };
  const climateFactor: Record<Climate, number> = { temperate: 1, hot: 1.1 };
  const raw = base * activityFactor[profile.activity] * climateFactor[profile.climate];
  const rounded = Math.round(raw / 50) * 50;
  return Math.min(5000, Math.max(1500, rounded));
}

export function totalForDate(entries: WaterEntry[], date: string): number {
  return entries.filter((e) => e.date === date).reduce((sum, e) => sum + e.volumeMl, 0);
}

export function progress(entries: WaterEntry[], date: string, goalMl: number): number {
  if (goalMl <= 0) return 0;
  return Math.min(1, totalForDate(entries, date) / goalMl);
}

/** Quick-add presets in ml. */
export const QUICK_ADD = [
  { key: 'glass', ml: 250 },
  { key: 'bottle', ml: 500 },
  { key: 'mug', ml: 350 },
] as const;
