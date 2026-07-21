import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { RecognizedFood } from '@/types';

/**
 * Send a food photo to the `recognize-food` Supabase Edge Function, which calls
 * Claude Haiku server-side (the Anthropic key never ships in the app) and
 * returns structured nutrition data. The photo is passed as base64 and is NOT
 * persisted anywhere — the function reads it, returns the result, and discards
 * it. We keep only the structured result the user saves.
 */

export class AINotConfiguredError extends Error {
  constructor() {
    super('AI recognition is not configured');
    this.name = 'AINotConfiguredError';
  }
}

export interface RecognizeResponse {
  items: RecognizedFood[];
}

export async function recognizeFood(base64Jpeg: string): Promise<RecognizedFood[]> {
  if (!isSupabaseConfigured || !supabase) {
    throw new AINotConfiguredError();
  }

  const { data, error } = await supabase.functions.invoke<RecognizeResponse>('recognize-food', {
    body: { image: base64Jpeg },
  });

  if (error) throw error;

  // Defensive: the model can occasionally return malformed items — keep only
  // well-formed ones and clamp confidence into range.
  const items = (data?.items ?? []).filter(
    (i): i is RecognizedFood =>
      typeof i?.name === 'string' && i.macros != null && typeof i.macros.kcal === 'number',
  );

  return items.map((i) => ({
    ...i,
    grams: Math.max(0, Math.round(i.grams || 0)),
    confidence: Math.min(1, Math.max(0, i.confidence ?? 0.5)),
    macros: {
      kcal: Math.max(0, Math.round(i.macros.kcal)),
      protein: Math.max(0, Math.round(i.macros.protein || 0)),
      fat: Math.max(0, Math.round(i.macros.fat || 0)),
      carbs: Math.max(0, Math.round(i.macros.carbs || 0)),
    },
  }));
}
