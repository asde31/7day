import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import { cancelScheduled, scheduleAlarm } from '@/lib/notifications';
import { isoDate } from '@/features/alarm/logic';
import type { Alarm, MissionType, WakeOutcome, WakeRecord } from '@/types';

let idCounter = 0;
function makeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

interface AlarmState {
  alarms: Alarm[];
  history: WakeRecord[];
  addAlarm: (input: Omit<Alarm, 'id' | 'scheduledIds' | 'createdAt'>) => Promise<Alarm>;
  updateAlarm: (id: string, patch: Partial<Alarm>) => Promise<void>;
  toggleAlarm: (id: string, enabled: boolean) => Promise<void>;
  removeAlarm: (id: string) => Promise<void>;
  recordWake: (alarmId: string, outcome: WakeOutcome, missionType: MissionType) => void;
}

async function reschedule(alarm: Alarm): Promise<Alarm> {
  await cancelScheduled(alarm.scheduledIds);
  const scheduledIds = alarm.enabled ? await scheduleAlarm(alarm) : [];
  return { ...alarm, scheduledIds };
}

export const useAlarmStore = create<AlarmState>()(
  persist(
    (set, get) => ({
      alarms: [],
      history: [],

      addAlarm: async (input) => {
        const base: Alarm = {
          ...input,
          id: makeId('alarm'),
          scheduledIds: [],
          createdAt: new Date().toISOString(),
        };
        const scheduled = await reschedule(base);
        set((s) => ({ alarms: [...s.alarms, scheduled] }));
        return scheduled;
      },

      updateAlarm: async (id, patch) => {
        const current = get().alarms.find((a) => a.id === id);
        if (!current) return;
        const scheduled = await reschedule({ ...current, ...patch });
        set((s) => ({ alarms: s.alarms.map((a) => (a.id === id ? scheduled : a)) }));
      },

      toggleAlarm: async (id, enabled) => {
        await get().updateAlarm(id, { enabled });
      },

      removeAlarm: async (id) => {
        const current = get().alarms.find((a) => a.id === id);
        if (current) await cancelScheduled(current.scheduledIds);
        set((s) => ({ alarms: s.alarms.filter((a) => a.id !== id) }));
      },

      recordWake: (alarmId, outcome, missionType) => {
        const record: WakeRecord = {
          id: makeId('wake'),
          alarmId,
          date: isoDate(new Date()),
          wokeAt: outcome === 'success' ? new Date().toISOString() : null,
          outcome,
          missionType,
        };
        set((s) => ({ history: [record, ...s.history].slice(0, 400) }));
      },
    }),
    {
      name: 'sevenday.alarms',
      storage: createJSONStorage(() => zustandStorage),
      // Only persist domain data, not the action functions.
      partialize: (s) => ({ alarms: s.alarms, history: s.history }),
    },
  ),
);
