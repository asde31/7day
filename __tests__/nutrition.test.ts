import { bmr, tdee, dailyTargets, dailyTotals, scaleMacros, mealTypeForHour } from '@/features/nutrition/logic';
import type { MealEntry, NutritionProfile } from '@/types';

const male: NutritionProfile = {
  sex: 'male',
  age: 30,
  heightCm: 180,
  weightKg: 80,
  activity: 'moderate',
  goal: 'maintain',
};

describe('BMR / TDEE (Mifflin-St Jeor)', () => {
  it('computes male BMR', () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    expect(bmr(male)).toBe(1780);
  });

  it('computes female BMR (−161 constant)', () => {
    expect(bmr({ ...male, sex: 'female' })).toBe(1780 - 166); // difference of 166 (5 → -161)
  });

  it('applies the activity factor', () => {
    expect(tdee(male)).toBeCloseTo(1780 * 1.55);
  });
});

describe('dailyTargets', () => {
  it('maintain ≈ TDEE with macros summing to ~kcal', () => {
    const tg = dailyTargets(male);
    expect(tg.kcal).toBeGreaterThan(2600);
    expect(tg.kcal).toBeLessThan(2800);
    const fromMacros = tg.protein * 4 + tg.fat * 9 + tg.carbs * 4;
    expect(Math.abs(fromMacros - tg.kcal)).toBeLessThan(60); // rounding tolerance
  });

  it('lose < maintain < gain', () => {
    const lose = dailyTargets({ ...male, goal: 'lose' }).kcal;
    const maintain = dailyTargets({ ...male, goal: 'maintain' }).kcal;
    const gain = dailyTargets({ ...male, goal: 'gain' }).kcal;
    expect(lose).toBeLessThan(maintain);
    expect(maintain).toBeLessThan(gain);
  });
});

describe('scaleMacros', () => {
  it('rescales proportionally with portion', () => {
    const base = { kcal: 600, protein: 20, fat: 25, carbs: 70 };
    expect(scaleMacros(base, 300, 150)).toEqual({ kcal: 300, protein: 10, fat: 13, carbs: 35 });
  });

  it('handles zero base grams safely', () => {
    expect(scaleMacros({ kcal: 100, protein: 1, fat: 1, carbs: 1 }, 0, 200)).toEqual({
      kcal: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    });
  });
});

describe('dailyTotals', () => {
  const entries: MealEntry[] = [
    { id: '1', date: '2026-07-21', mealType: 'lunch', name: 'Плов', grams: 300, macros: { kcal: 600, protein: 20, fat: 25, carbs: 70 }, source: 'ai_photo', at: '' },
    { id: '2', date: '2026-07-21', mealType: 'snack', name: 'Нон', grams: 100, macros: { kcal: 260, protein: 8, fat: 2, carbs: 50 }, source: 'manual', at: '' },
    { id: '3', date: '2026-07-20', mealType: 'dinner', name: 'X', grams: 100, macros: { kcal: 999, protein: 1, fat: 1, carbs: 1 }, source: 'manual', at: '' },
  ];

  it('sums only the given date', () => {
    expect(dailyTotals(entries, '2026-07-21')).toEqual({ kcal: 860, protein: 28, fat: 27, carbs: 120 });
    expect(dailyTotals(entries, '2026-07-19')).toEqual({ kcal: 0, protein: 0, fat: 0, carbs: 0 });
  });
});

describe('mealTypeForHour', () => {
  it('maps the clock to a meal slot', () => {
    expect(mealTypeForHour(8)).toBe('breakfast');
    expect(mealTypeForHour(13)).toBe('lunch');
    expect(mealTypeForHour(19)).toBe('dinner');
    expect(mealTypeForHour(23)).toBe('snack');
  });
});
