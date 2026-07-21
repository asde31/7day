import type { BreathingTechnique, CravingLog, QuitProfile } from '@/types';

/**
 * Breathing technique library. Patterns are expressed as ordered phase steps
 * so the animated guide can drive its expand/contract timing directly from the
 * data. `premium` gates advanced techniques behind the subscription.
 */
export const TECHNIQUES: BreathingTechnique[] = [
  {
    id: 'box',
    key: 'box',
    pattern: [
      { phase: 'inhale', seconds: 4 },
      { phase: 'hold', seconds: 4 },
      { phase: 'exhale', seconds: 4 },
      { phase: 'holdEmpty', seconds: 4 },
    ],
    defaultCycles: 5,
    premium: false, // free tier includes box breathing
  },
  {
    id: '478',
    key: 'fourSevenEight',
    pattern: [
      { phase: 'inhale', seconds: 4 },
      { phase: 'hold', seconds: 7 },
      { phase: 'exhale', seconds: 8 },
    ],
    defaultCycles: 4,
    premium: false, // free tier includes 4-7-8
  },
  {
    id: 'diaphragmatic',
    key: 'diaphragmatic',
    pattern: [
      { phase: 'inhale', seconds: 5 },
      { phase: 'exhale', seconds: 5 },
    ],
    defaultCycles: 8,
    premium: true,
  },
  {
    id: 'coherent',
    key: 'coherent',
    pattern: [
      { phase: 'inhale', seconds: 6 },
      { phase: 'exhale', seconds: 6 },
    ],
    defaultCycles: 10,
    premium: true,
  },
];

export function techniqueById(id: string): BreathingTechnique | undefined {
  return TECHNIQUES.find((t) => t.id === id);
}

/** Total seconds for a full session of `cycles` repetitions. */
export function sessionSeconds(technique: BreathingTechnique, cycles: number): number {
  const cycle = technique.pattern.reduce((sum, s) => sum + s.seconds, 0);
  return cycle * cycles;
}

// --- Quit-smoking stats -----------------------------------------------------

export interface QuitStats {
  smokeFreeDays: number;
  smokeFreeHours: number;
  cigarettesAvoided: number;
  moneySavedUzs: number;
  cravingsBeaten: number;
}

const HOUR_MS = 3600_000;

export function quitStats(
  profile: QuitProfile,
  cravings: CravingLog[],
  now: Date = new Date(),
): QuitStats {
  const cravingsBeaten = cravings.filter((c) => c.resolved).length;

  if (!profile.quitDate) {
    return { smokeFreeDays: 0, smokeFreeHours: 0, cigarettesAvoided: 0, moneySavedUzs: 0, cravingsBeaten };
  }

  const elapsedMs = Math.max(0, now.getTime() - new Date(profile.quitDate).getTime());
  const smokeFreeHours = Math.floor(elapsedMs / HOUR_MS);
  const smokeFreeDays = Math.floor(smokeFreeHours / 24);

  const cigarettesAvoided = Math.floor((elapsedMs / (24 * HOUR_MS)) * profile.cigarettesPerDay);
  const pricePerCig =
    profile.cigarettesPerPack > 0 ? profile.packPriceUzs / profile.cigarettesPerPack : 0;
  const moneySavedUzs = Math.round(cigarettesAvoided * pricePerCig);

  return { smokeFreeDays, smokeFreeHours, cigarettesAvoided, moneySavedUzs, cravingsBeaten };
}

export const CRAVING_TRIGGERS = [
  'stress',
  'afterMeal',
  'driving',
  'coffee',
  'social',
  'boredom',
  'other',
] as const;
