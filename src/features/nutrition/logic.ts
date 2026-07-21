import type {
  Activity,
  Goal,
  Macros,
  MealEntry,
  NutritionProfile,
  NutritionTargets,
} from '@/types';

/**
 * Nutrition math — pure and unit-tested. The daily calorie target uses the
 * Mifflin-St Jeor equation (the industry-standard BMR estimate), scaled by an
 * activity factor and adjusted for the goal. Macros are split by goal.
 */

const ACTIVITY_FACTOR: Record<Activity, number> = {
  low: 1.375,
  moderate: 1.55,
  high: 1.725,
};

const GOAL_FACTOR: Record<Goal, number> = {
  lose: 0.85, // ~15% deficit
  maintain: 1,
  gain: 1.1, // ~10% surplus
};

/** Macro split (protein / fat / carbs as fraction of kcal) per goal. */
const MACRO_SPLIT: Record<Goal, { p: number; f: number; c: number }> = {
  lose: { p: 0.35, f: 0.3, c: 0.35 },
  maintain: { p: 0.3, f: 0.3, c: 0.4 },
  gain: { p: 0.3, f: 0.25, c: 0.45 },
};

/** Basal metabolic rate (kcal/day), Mifflin-St Jeor. */
export function bmr(profile: NutritionProfile): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  return profile.sex === 'male' ? base + 5 : base - 161;
}

/** Total daily energy expenditure (kcal/day). */
export function tdee(profile: NutritionProfile): number {
  return bmr(profile) * ACTIVITY_FACTOR[profile.activity];
}

/** Goal-adjusted daily targets: kcal plus protein/fat/carbs in grams. */
export function dailyTargets(profile: NutritionProfile): NutritionTargets {
  const kcal = Math.round((tdee(profile) * GOAL_FACTOR[profile.goal]) / 10) * 10;
  const split = MACRO_SPLIT[profile.goal];
  return {
    kcal,
    protein: Math.round((kcal * split.p) / 4), // 4 kcal/g
    fat: Math.round((kcal * split.f) / 9), // 9 kcal/g
    carbs: Math.round((kcal * split.c) / 4), // 4 kcal/g
  };
}

const EMPTY: Macros = { kcal: 0, protein: 0, fat: 0, carbs: 0 };

/** Sum of all meals logged on a given ISO date. */
export function dailyTotals(entries: MealEntry[], date: string): Macros {
  return entries
    .filter((e) => e.date === date)
    .reduce<Macros>(
      (acc, e) => ({
        kcal: acc.kcal + e.macros.kcal,
        protein: acc.protein + e.macros.protein,
        fat: acc.fat + e.macros.fat,
        carbs: acc.carbs + e.macros.carbs,
      }),
      { ...EMPTY },
    );
}

/** Rescale a food's macros when the user edits the portion (grams). */
export function scaleMacros(per: Macros, fromGrams: number, toGrams: number): Macros {
  if (fromGrams <= 0) return { ...EMPTY };
  const k = toGrams / fromGrams;
  return {
    kcal: Math.round(per.kcal * k),
    protein: Math.round(per.protein * k),
    fat: Math.round(per.fat * k),
    carbs: Math.round(per.carbs * k),
  };
}

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

/** Pick a sensible default meal slot from the current hour. */
export function mealTypeForHour(hour: number): (typeof MEAL_TYPES)[number] {
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

export function defaultNutritionProfile(): NutritionProfile {
  return { sex: 'male', age: 25, heightCm: 175, weightKg: 70, activity: 'moderate', goal: 'maintain' };
}
