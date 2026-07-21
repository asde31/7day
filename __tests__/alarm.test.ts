import {
  computeStreak,
  formatTime,
  isoDate,
  longestStreak,
  nextOccurrence,
  parseTime,
} from '@/features/alarm/logic';
import type { Alarm, WakeRecord } from '@/types';

function alarm(partial: Partial<Alarm>): Alarm {
  return {
    id: 'a1',
    label: '',
    timeMinutes: 6 * 60,
    repeatDays: [],
    enabled: true,
    mission: { type: 'math', difficulty: 'medium' },
    snoozeLocked: true,
    fajrLinked: false,
    scheduledIds: [],
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

function wake(date: string, outcome: WakeRecord['outcome']): WakeRecord {
  return { id: date, alarmId: 'a1', date, wokeAt: null, outcome, missionType: 'math' };
}

describe('time formatting', () => {
  it('formats and parses HH:MM', () => {
    expect(formatTime(6 * 60 + 5)).toBe('06:05');
    expect(formatTime(23 * 60 + 59)).toBe('23:59');
    expect(parseTime('06:05')).toBe(365);
  });
});

describe('nextOccurrence', () => {
  it('one-shot rolls to tomorrow when time has passed', () => {
    const from = new Date('2026-07-21T08:00:00');
    const next = nextOccurrence(alarm({ timeMinutes: 6 * 60, repeatDays: [] }), from);
    expect(next.getDate()).toBe(22);
    expect(next.getHours()).toBe(6);
  });

  it('one-shot stays today when time is still ahead', () => {
    const from = new Date('2026-07-21T05:00:00');
    const next = nextOccurrence(alarm({ timeMinutes: 6 * 60, repeatDays: [] }), from);
    expect(next.getDate()).toBe(21);
  });

  it('repeating picks the next selected weekday', () => {
    // 2026-07-21 is a Tuesday (getDay() === 2). Alarm repeats Mon/Wed/Fri.
    const from = new Date('2026-07-21T08:00:00');
    const next = nextOccurrence(alarm({ timeMinutes: 6 * 60, repeatDays: [1, 3, 5] }), from);
    expect(next.getDay()).toBe(3); // Wednesday
    expect(next.getDate()).toBe(22);
  });
});

describe('streaks', () => {
  it('counts consecutive successes ending today', () => {
    const today = new Date('2026-07-21T09:00:00');
    const records = [
      wake('2026-07-21', 'success'),
      wake('2026-07-20', 'success'),
      wake('2026-07-19', 'success'),
      wake('2026-07-17', 'success'), // gap on the 18th
    ];
    expect(computeStreak(records, today)).toBe(3);
  });

  it('still counts if today is not yet recorded', () => {
    const today = new Date('2026-07-21T09:00:00');
    const records = [wake('2026-07-20', 'success'), wake('2026-07-19', 'success')];
    expect(computeStreak(records, today)).toBe(2);
  });

  it('breaks on a failed day', () => {
    const today = new Date('2026-07-21T09:00:00');
    const records = [wake('2026-07-21', 'failed'), wake('2026-07-20', 'success')];
    expect(computeStreak(records, today)).toBe(0);
  });

  it('longestStreak finds the best run', () => {
    const records = [
      wake('2026-07-01', 'success'),
      wake('2026-07-02', 'success'),
      wake('2026-07-03', 'success'),
      wake('2026-07-10', 'success'),
    ];
    expect(longestStreak(records)).toBe(3);
  });
});

describe('isoDate', () => {
  it('formats local date', () => {
    expect(isoDate(new Date(2026, 6, 5))).toBe('2026-07-05');
  });
});
