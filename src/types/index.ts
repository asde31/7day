/** Shared domain types for the 7day app. */

// ---------------------------------------------------------------------------
// Alarm + accountability
// ---------------------------------------------------------------------------

/** 0 = Sunday … 6 = Saturday, matching JS Date.getDay(). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type MissionType = 'math' | 'steps' | 'affirmation' | 'photo';

export type MissionDifficulty = 'easy' | 'medium' | 'hard';

export interface MissionConfig {
  type: MissionType;
  difficulty: MissionDifficulty;
  /** Steps mission: number of steps required. */
  stepCount?: number;
  /** Affirmation mission: the phrase the user must speak. */
  phrase?: string;
  /** Photo mission: free-text hint of the object/location to photograph. */
  photoHint?: string;
}

export interface Alarm {
  id: string;
  label: string;
  /** Minutes after local midnight, 0–1439. */
  timeMinutes: number;
  /** Days the alarm repeats. Empty array = one-shot (next occurrence only). */
  repeatDays: Weekday[];
  enabled: boolean;
  mission: MissionConfig;
  /** Block snooze until the mission is completed. */
  snoozeLocked: boolean;
  /** Optional binding to the local Fajr prayer time. */
  fajrLinked: boolean;
  /** Notification identifiers currently scheduled for this alarm. */
  scheduledIds: string[];
  createdAt: string;
}

export type WakeOutcome = 'success' | 'failed' | 'snoozed';

export interface WakeRecord {
  id: string;
  alarmId: string;
  /** ISO date (YYYY-MM-DD) the alarm was scheduled for. */
  date: string;
  /** Actual wake time — ISO datetime when the mission was completed. */
  wokeAt: string | null;
  outcome: WakeOutcome;
  missionType: MissionType;
}

// ---------------------------------------------------------------------------
// Water
// ---------------------------------------------------------------------------

export type Activity = 'low' | 'moderate' | 'high';
export type Climate = 'temperate' | 'hot';

export interface WaterProfile {
  weightKg: number;
  activity: Activity;
  climate: Climate;
}

export interface WaterEntry {
  id: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  volumeMl: number;
  at: string;
}

// ---------------------------------------------------------------------------
// Breathing
// ---------------------------------------------------------------------------

export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'holdEmpty';

export interface BreathStep {
  phase: BreathPhase;
  seconds: number;
}

export interface BreathingTechnique {
  id: string;
  /** i18n key suffix, e.g. 'box' → breathing.techniques.box.name */
  key: string;
  pattern: BreathStep[];
  /** Default number of full cycles. */
  defaultCycles: number;
  premium: boolean;
}

export type CravingTrigger =
  | 'stress'
  | 'afterMeal'
  | 'driving'
  | 'coffee'
  | 'social'
  | 'boredom'
  | 'other';

export interface CravingLog {
  id: string;
  at: string;
  trigger: CravingTrigger;
  /** Whether the user completed a breathing session for this craving. */
  resolved: boolean;
}

export interface QuitProfile {
  /** ISO datetime the user marked as their quit start. */
  quitDate: string | null;
  cigarettesPerDay: number;
  packPriceUzs: number;
  cigarettesPerPack: number;
}

// ---------------------------------------------------------------------------
// Module 3: AI nutrition
// ---------------------------------------------------------------------------

export type Sex = 'male' | 'female';
export type Goal = 'lose' | 'maintain' | 'gain';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type MealSource = 'ai_photo' | 'manual';

export interface Macros {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface NutritionProfile {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: Goal;
}

/** Daily calorie + macro targets derived from the profile. */
export interface NutritionTargets extends Macros {}

/** One food item returned by the vision model — always user-editable before saving. */
export interface RecognizedFood {
  name: string;
  grams: number;
  macros: Macros;
  /** Model self-reported confidence 0–1; drives whether we nudge the user to check. */
  confidence: number;
}

export interface MealEntry {
  id: string;
  /** ISO date YYYY-MM-DD. */
  date: string;
  mealType: MealType;
  name: string;
  grams: number;
  macros: Macros;
  source: MealSource;
  at: string;
}
