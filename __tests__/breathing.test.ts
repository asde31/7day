import { quitStats, sessionSeconds, techniqueById, TECHNIQUES } from '@/features/breathing/logic';
import { fajrMinutes, UZ_CITIES } from '@/features/alarm/fajr';
import type { CravingLog, QuitProfile } from '@/types';

describe('breathing techniques', () => {
  it('box breathing is a 16s cycle', () => {
    const box = techniqueById('box')!;
    expect(sessionSeconds(box, 1)).toBe(16);
    expect(sessionSeconds(box, 5)).toBe(80);
  });

  it('free tier includes box and 4-7-8', () => {
    expect(techniqueById('box')!.premium).toBe(false);
    expect(techniqueById('478')!.premium).toBe(false);
    expect(TECHNIQUES.some((t) => t.premium)).toBe(true);
  });
});

describe('quitStats', () => {
  const profile: QuitProfile = {
    quitDate: '2026-07-11T00:00:00.000Z',
    cigarettesPerDay: 20,
    packPriceUzs: 25000,
    cigarettesPerPack: 20,
  };
  const cravings: CravingLog[] = [
    { id: '1', at: '', trigger: 'stress', resolved: true },
    { id: '2', at: '', trigger: 'coffee', resolved: true },
    { id: '3', at: '', trigger: 'boredom', resolved: false },
  ];

  it('computes smoke-free days, avoided cigarettes and money saved', () => {
    const now = new Date('2026-07-21T00:00:00.000Z'); // exactly 10 days later
    const stats = quitStats(profile, cravings, now);
    expect(stats.smokeFreeDays).toBe(10);
    expect(stats.cigarettesAvoided).toBe(200);
    // price per cigarette = 25000/20 = 1250 → 200 * 1250
    expect(stats.moneySavedUzs).toBe(250000);
    expect(stats.cravingsBeaten).toBe(2);
  });

  it('returns zeros when no quit date is set', () => {
    const stats = quitStats({ ...profile, quitDate: null }, cravings);
    expect(stats.smokeFreeDays).toBe(0);
    expect(stats.moneySavedUzs).toBe(0);
    expect(stats.cravingsBeaten).toBe(2);
  });
});

describe('fajr calculation', () => {
  it('returns a plausible pre-dawn time for Tashkent in July', () => {
    const { lat, lon } = UZ_CITIES.Tashkent;
    // Force UTC+5 (Uzbekistan) regardless of the test host timezone.
    const minutes = fajrMinutes(new Date('2026-07-21T00:00:00'), lat, lon, {
      timezoneOffsetHours: 5,
    });
    expect(minutes).not.toBeNull();
    // Tashkent Fajr in mid-July is roughly 03:20–03:50 local.
    expect(minutes!).toBeGreaterThan(3 * 60);
    expect(minutes!).toBeLessThan(4 * 60);
  });
});
