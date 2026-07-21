import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateStorage } from 'zustand/middleware';

/**
 * Zustand `persist` adapter backed by AsyncStorage. All 7day domain state is
 * kept on-device first (the alarm must work fully offline); Supabase sync is
 * an additive layer, not the source of truth.
 */
export const zustandStorage: StateStorage = {
  getItem: async (name) => (await AsyncStorage.getItem(name)) ?? null,
  setItem: async (name, value) => {
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name) => {
    await AsyncStorage.removeItem(name);
  },
};
