import type { Alarm, WakeRecord, Weekday } from '@/types';

/** Format minutes-after-midnight as HH:MM (24h). */
export function formatTime(timeMinutes: number): string {
  const h = Math.floor(timeMinutes / 60);
  const m = timeMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function parseTime(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h % 24) * 60 + (m % 60);
}

/** Local ISO date (YYYY-MM-DD) for a Date, using local timezone. */
export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Compute the next Date an alarm will fire, relative to `from`. Repeating
 * alarms pick the soonest selected weekday; one-shots pick today (if the time
 * hasn't passed) or tomorrow.
 */
export function nextOccurrence(alarm: Alarm, from: Date = new Date()): Date {
  const candidate = new Date(from);
  candidate.setSeconds(0, 0);
  candidate.setHours(Math.floor(alarm.timeMinutes / 60), alarm.timeMinutes % 60, 0, 0);

  if (alarm.repeatDays.length === 0) {
    if (candidate.getTime() <= from.getTime()) candidate.setDate(candidate.getDate() + 1);
    return candidate;
  }

  for (let offset = 0; offset < 8; offset++) {
    const d = new Date(candidate);
    d.setDate(candidate.getDate() + offset);
    const isFuture = d.getTime() > from.getTime();
    if (alarm.repeatDays.includes(d.getDay() as Weekday) && (offset > 0 || isFuture)) {
      return d;
    }
  }
  return candidate;
}

/** Human "in 7h 20m" style delta between now and the next occurrence. */
export function timeUntil(target: Date, from: Date = new Date()): { hours: number; minutes: number } {
  const diffMs = Math.max(0, target.getTime() - from.getTime());
  const totalMin = Math.round(diffMs / 60000);
  return { hours: Math.floor(totalMin / 60), minutes: totalMin % 60 };
}

/**
 * Current streak = consecutive days (ending today or yesterday) with a
 * successful wake. A gap of more than one day breaks the streak. Records for
 * the same day are collapsed to a single success if any succeeded.
 */
export function computeStreak(records: WakeRecord[], today: Date = new Date()): number {
  const successByDate = new Map<string, boolean>();
  for (const r of records) {
    const prev = successByDate.get(r.date) ?? false;
    successByDate.set(r.date, prev || r.outcome === 'success');
  }

  let streak = 0;
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);

  // Allow the streak to still count if today hasn't been recorded yet.
  if (!successByDate.has(isoDate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (successByDate.get(isoDate(cursor)) === true) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function longestStreak(records: WakeRecord[]): number {
  const dates = [...new Set(records.filter((r) => r.outcome === 'success').map((r) => r.date))].sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const d of dates) {
    const cur = new Date(d + 'T00:00:00');
    if (prev && (cur.getTime() - prev.getTime()) / 86400000 === 1) {
      run++;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    prev = cur;
  }
  return best;
}
