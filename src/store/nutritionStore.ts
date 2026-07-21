import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import { isoDate } from '@/features/alarm/logic';
import { dailyTargets, defaultNutritionProfile } from '@/features/nutrition/logic';
import type { MealEntry, MealSource, MealType, Macros, NutritionProfile, NutritionTargets } from '@/types';

interface NutritionState {
  profile: NutritionProfile;
  entries: MealEntry[];
  setProfile: (profile: NutritionProfile) => void;
  addMeal: (input: {
    mealType: MealType;
    name: string;
    grams: number;
    macros: Macros;
    source: MealSource;
  }) => void;
  removeMeal: (id: string) => void;
  targets: () => NutritionTargets;
}

let mealId = 0;

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      profile: defaultNutritionProfile(),
      entries: [],

      setProfile: (profile) => set({ profile }),

      addMeal: (input) => {
        mealId += 1;
        const entry: MealEntry = {
          id: `meal_${Date.now()}_${mealId}`,
          date: isoDate(new Date()),
          at: new Date().toISOString(),
          ...input,
        };
        set((s) => ({ entries: [entry, ...s.entries].slice(0, 3000) }));
      },

      removeMeal: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      targets: () => dailyTargets(get().profile),
    }),
    {
      name: 'sevenday.nutrition',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (s) => ({ profile: s.profile, entries: s.entries }),
    },
  ),
);
