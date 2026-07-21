import { dailyGoalMl, progress, totalForDate } from '@/features/water/logic';
import type { WaterEntry } from '@/types';

describe('dailyGoalMl', () => {
  it('scales with weight and clamps to range', () => {
    expect(dailyGoalMl({ weightKg: 70, activity: 'low', climate: 'temperate' })).toBe(2450);
    // heavier + high activity + hot climate is larger
    const active = dailyGoalMl({ weightKg: 90, activity: 'high', climate: 'hot' });
    const sedentary = dailyGoalMl({ weightKg: 90, activity: 'low', climate: 'temperate' });
    expect(active).toBeGreaterThan(sedentary);
    // clamp
    expect(dailyGoalMl({ weightKg: 30, activity: 'low', climate: 'temperate' })).toBeGreaterThanOrEqual(1500);
    expect(dailyGoalMl({ weightKg: 200, activity: 'high', climate: 'hot' })).toBeLessThanOrEqual(5000);
  });
});

describe('daily totals & progress', () => {
  const entries: WaterEntry[] = [
    { id: '1', date: '2026-07-21', volumeMl: 250, at: '' },
    { id: '2', date: '2026-07-21', volumeMl: 500, at: '' },
    { id: '3', date: '2026-07-20', volumeMl: 1000, at: '' },
  ];

  it('sums only the requested date', () => {
    expect(totalForDate(entries, '2026-07-21')).toBe(750);
    expect(totalForDate(entries, '2026-07-20')).toBe(1000);
    expect(totalForDate(entries, '2026-07-19')).toBe(0);
  });

  it('progress is capped at 1', () => {
    expect(progress(entries, '2026-07-21', 1500)).toBeCloseTo(0.5);
    expect(progress(entries, '2026-07-20', 500)).toBe(1);
    expect(progress(entries, '2026-07-21', 0)).toBe(0);
  });
});
