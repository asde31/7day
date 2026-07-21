import type { MissionConfig, MissionDifficulty } from '@/types';

/**
 * Mission engine — the accountability core. Each mission produces a challenge
 * the user must clear to dismiss the alarm; snooze stays locked until then.
 * Kept as pure functions so the behaviour is fully unit-testable.
 */

// --- Math mission -----------------------------------------------------------

export interface MathProblem {
  prompt: string;
  answer: number;
}

const DIFFICULTY_RANGE: Record<MissionDifficulty, { max: number; ops: string[] }> = {
  easy: { max: 12, ops: ['+', '-'] },
  medium: { max: 30, ops: ['+', '-', '×'] },
  hard: { max: 99, ops: ['+', '-', '×'] },
};

function randInt(max: number): number {
  return Math.floor(Math.random() * (max + 1));
}

/** Generate one arithmetic problem for the given difficulty. */
export function generateMathProblem(difficulty: MissionDifficulty): MathProblem {
  const { max, ops } = DIFFICULTY_RANGE[difficulty];
  const op = ops[randInt(ops.length - 1)];
  let a = randInt(max);
  let b = randInt(op === '×' ? Math.min(12, max) : max);

  if (op === '-' && b > a) [a, b] = [b, a]; // keep answers non-negative
  if (op === '×') a = randInt(Math.min(12, max));

  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  return { prompt: `${a} ${op} ${b}`, answer };
}

/**
 * A math mission is a small set of problems of increasing difficulty, per the
 * spec ("2-3 примера возрастающей сложности").
 */
export function generateMathSet(difficulty: MissionDifficulty): MathProblem[] {
  const ladder: MissionDifficulty[] =
    difficulty === 'easy'
      ? ['easy', 'easy']
      : difficulty === 'medium'
        ? ['easy', 'medium', 'medium']
        : ['medium', 'hard', 'hard'];
  return ladder.map(generateMathProblem);
}

// --- Affirmation mission ----------------------------------------------------

/** Normalise speech-recognition output for tolerant comparison. */
export function normalizePhrase(input: string): string {
  return input
    .toLowerCase()
    .replace(/[.,!?;:"'`—–-]/g, ' ')
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fuzzy-match a spoken phrase against the target. Speech-to-text is imperfect,
 * so we accept a word-overlap ratio rather than an exact string match.
 */
export function affirmationMatches(spoken: string, target: string, threshold = 0.7): boolean {
  const targetWords = normalizePhrase(target).split(' ').filter(Boolean);
  if (targetWords.length === 0) return true;
  const spokenWords = new Set(normalizePhrase(spoken).split(' ').filter(Boolean));
  const hits = targetWords.filter((w) => spokenWords.has(w)).length;
  return hits / targetWords.length >= threshold;
}

// --- Defaults ---------------------------------------------------------------

export function defaultMission(): MissionConfig {
  return { type: 'math', difficulty: 'medium' };
}

export function defaultStepCount(difficulty: MissionDifficulty): number {
  return difficulty === 'easy' ? 15 : difficulty === 'medium' ? 30 : 50;
}
