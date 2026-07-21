import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import { isoDate } from '@/features/alarm/logic';
import { dailyGoalMl } from '@/features/water/logic';
import type { WaterEntry, WaterProfile } from '@/types';

interface WaterState {
  profile: WaterProfile;
  entries: WaterEntry[];
  reminderIntervalMin: number;
  reminderIds: string[];
  setProfile: (profile: WaterProfile) => void;
  addWater: (volumeMl: number) => void;
  undoLast: (date: string) => void;
  goalMl: () => number;
  setReminderIds: (ids: string[]) => void;
  setReminderInterval: (min: number) => void;
}

let waterId = 0;

export const useWaterStore = create<WaterState>()(
  persist(
    (set, get) => ({
      profile: { weightKg: 70, activity: 'moderate', climate: 'hot' },
      entries: [],
      reminderIntervalMin: 120,
      reminderIds: [],

      setProfile: (profile) => set({ profile }),

      addWater: (volumeMl) => {
        waterId += 1;
        const entry: WaterEntry = {
          id: `water_${Date.now()}_${waterId}`,
          date: isoDate(new Date()),
          volumeMl,
          at: new Date().toISOString(),
        };
        set((s) => ({ entries: [entry, ...s.entries].slice(0, 2000) }));
      },

      undoLast: (date) => {
        const idx = get().entries.findIndex((e) => e.date === date);
        if (idx === -1) return;
        set((s) => ({ entries: s.entries.filter((_, i) => i !== idx) }));
      },

      goalMl: () => dailyGoalMl(get().profile),

      setReminderIds: (reminderIds) => set({ reminderIds }),
      setReminderInterval: (reminderIntervalMin) => set({ reminderIntervalMin }),
    }),
    {
      name: 'sevenday.water',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (s) => ({
        profile: s.profile,
        entries: s.entries,
        reminderIntervalMin: s.reminderIntervalMin,
        reminderIds: s.reminderIds,
      }),
    },
  ),
);
