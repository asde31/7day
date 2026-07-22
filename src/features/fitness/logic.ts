import type { Workout, WorkoutCategory, WorkoutGender, WorkoutLevel } from '@/types';

/** Fitness library helpers — filtering, validation, and a starter seed. */

export const CATEGORIES: WorkoutCategory[] = [
  'hiit',
  'strength',
  'cardio',
  'yoga',
  'dance',
  'meditation',
];

export const LEVELS: WorkoutLevel[] = ['beginner', 'intermediate', 'advanced'];

export const GENDERS: WorkoutGender[] = ['all', 'male', 'female'];

export interface WorkoutFilter {
  category?: WorkoutCategory;
  level?: WorkoutLevel;
  gender?: WorkoutGender;
}

/** Filter the library. `all` gender content is always shown. */
export function filterWorkouts(list: Workout[], f: WorkoutFilter): Workout[] {
  return list.filter((w) => {
    if (f.category && w.category !== f.category) return false;
    if (f.level && w.level !== f.level) return false;
    if (f.gender && f.gender !== 'all' && w.gender !== 'all' && w.gender !== f.gender) return false;
    return true;
  });
}

/** Minimal sanity check for an admin-entered video URL. */
export function isValidVideoUrl(url: string): boolean {
  return /^https:\/\/.+\..+/.test(url.trim());
}

/**
 * Seed content shipped for offline testing — a public sample clip so video
 * playback can be verified before any real hosting/Supabase is wired. Replace
 * these via the in-app admin panel (or Supabase) with real workouts.
 */
const SAMPLE_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export function seedWorkouts(): Workout[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'seed_hiit',
      title: 'HIIT · Жиросжигание 15 мин',
      description: 'Интенсивная интервальная тренировка без оборудования.',
      videoUrl: SAMPLE_VIDEO,
      level: 'intermediate',
      category: 'hiit',
      gender: 'all',
      durationMin: 15,
      premium: false,
      createdAt: now,
    },
    {
      id: 'seed_yoga',
      title: 'Йога · Утренняя растяжка',
      description: 'Мягкая практика для энергичного старта дня.',
      videoUrl: SAMPLE_VIDEO,
      level: 'beginner',
      category: 'yoga',
      gender: 'all',
      durationMin: 20,
      premium: true,
      createdAt: now,
    },
    {
      id: 'seed_strength',
      title: 'Сила · Верх тела',
      description: 'Проработка груди, спины и рук.',
      videoUrl: SAMPLE_VIDEO,
      level: 'advanced',
      category: 'strength',
      gender: 'male',
      durationMin: 30,
      premium: true,
      createdAt: now,
    },
  ];
}
