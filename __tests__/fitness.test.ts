import { filterWorkouts, isValidVideoUrl, seedWorkouts } from '@/features/fitness/logic';
import type { Workout } from '@/types';

const list: Workout[] = seedWorkouts();

describe('seedWorkouts', () => {
  it('ships a non-empty starter library with valid URLs', () => {
    expect(list.length).toBeGreaterThan(0);
    for (const w of list) {
      expect(isValidVideoUrl(w.videoUrl)).toBe(true);
      expect(w.durationMin).toBeGreaterThan(0);
    }
  });
});

describe('filterWorkouts', () => {
  it('filters by category', () => {
    const hiit = filterWorkouts(list, { category: 'hiit' });
    expect(hiit.every((w) => w.category === 'hiit')).toBe(true);
    expect(hiit.length).toBeGreaterThan(0);
  });

  it('filters by level', () => {
    expect(filterWorkouts(list, { level: 'beginner' }).every((w) => w.level === 'beginner')).toBe(true);
  });

  it('gender "all" shows everything; a specific gender keeps its own + all', () => {
    expect(filterWorkouts(list, { gender: 'all' })).toHaveLength(list.length);
    const female = filterWorkouts(list, { gender: 'female' });
    expect(female.every((w) => w.gender === 'female' || w.gender === 'all')).toBe(true);
    // the male-only seed must be excluded from a female filter
    expect(female.some((w) => w.gender === 'male')).toBe(false);
  });

  it('no filter returns the full list', () => {
    expect(filterWorkouts(list, {})).toHaveLength(list.length);
  });
});

describe('isValidVideoUrl', () => {
  it('accepts https URLs with a host', () => {
    expect(isValidVideoUrl('https://stream.mux.com/abc.m3u8')).toBe(true);
    expect(isValidVideoUrl('https://x.com/v.mp4')).toBe(true);
  });

  it('rejects malformed or non-https input', () => {
    expect(isValidVideoUrl('http://x.com/v.mp4')).toBe(false);
    expect(isValidVideoUrl('just text')).toBe(false);
    expect(isValidVideoUrl('')).toBe(false);
  });
});
