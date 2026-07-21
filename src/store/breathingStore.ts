import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import type { CravingLog, CravingTrigger, QuitProfile } from '@/types';

interface BreathingState {
  quit: QuitProfile;
  cravings: CravingLog[];
  sessionsCompleted: number;
  setQuitProfile: (patch: Partial<QuitProfile>) => void;
  logCraving: (trigger: CravingTrigger, resolved: boolean) => string;
  resolveCraving: (id: string) => void;
  incrementSessions: () => void;
}

let cravingId = 0;

export const useBreathingStore = create<BreathingState>()(
  persist(
    (set) => ({
      quit: {
        quitDate: null,
        cigarettesPerDay: 10,
        packPriceUzs: 25000,
        cigarettesPerPack: 20,
      },
      cravings: [],
      sessionsCompleted: 0,

      setQuitProfile: (patch) => set((s) => ({ quit: { ...s.quit, ...patch } })),

      logCraving: (trigger, resolved) => {
        cravingId += 1;
        const id = `craving_${Date.now()}_${cravingId}`;
        const log: CravingLog = { id, at: new Date().toISOString(), trigger, resolved };
        set((s) => ({ cravings: [log, ...s.cravings].slice(0, 1000) }));
        return id;
      },

      resolveCraving: (id) =>
        set((s) => ({
          cravings: s.cravings.map((c) => (c.id === id ? { ...c, resolved: true } : c)),
        })),

      incrementSessions: () => set((s) => ({ sessionsCompleted: s.sessionsCompleted + 1 })),
    }),
    {
      name: 'sevenday.breathing',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (s) => ({
        quit: s.quit,
        cravings: s.cravings,
        sessionsCompleted: s.sessionsCompleted,
      }),
    },
  ),
);
