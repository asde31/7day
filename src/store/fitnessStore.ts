import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import { seedWorkouts } from '@/features/fitness/logic';
import type { Workout } from '@/types';

interface FitnessState {
  workouts: Workout[];
  /** Local admin flag for testing. In production this comes from Supabase (profiles.is_admin). */
  isAdmin: boolean;
  addWorkout: (input: Omit<Workout, 'id' | 'createdAt'>) => void;
  removeWorkout: (id: string) => void;
  setAdmin: (v: boolean) => void;
}

let workoutId = 0;

export const useFitnessStore = create<FitnessState>()(
  persist(
    (set) => ({
      workouts: seedWorkouts(),
      isAdmin: false,

      addWorkout: (input) => {
        workoutId += 1;
        const workout: Workout = {
          ...input,
          id: `workout_${Date.now()}_${workoutId}`,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ workouts: [workout, ...s.workouts] }));
      },

      removeWorkout: (id) => set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),

      setAdmin: (isAdmin) => set({ isAdmin }),
    }),
    {
      name: 'sevenday.fitness',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (s) => ({ workouts: s.workouts, isAdmin: s.isAdmin }),
    },
  ),
);
