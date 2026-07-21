/**
 * Fajr (dawn prayer) time calculation — used for the optional cultural trigger
 * that binds an alarm to local Fajr. Standard sun-angle method: we solve for
 * the moment the sun sits `angle` degrees below the horizon before sunrise.
 *
 * This is a compact, dependency-free implementation of the well-known
 * PrayTimes algorithm, accurate to ~1 minute for city-tier use. Default angle
 * 18° matches the "Muslim World League" convention commonly used in Uzbekistan.
 */

const DEG = Math.PI / 180;

function sind(d: number) {
  return Math.sin(d * DEG);
}
function cosd(d: number) {
  return Math.cos(d * DEG);
}
function fixHour(h: number) {
  return ((h % 24) + 24) % 24;
}

/** Julian day number for a date at 0h UTC. */
function julianDay(y: number, m: number, d: number): number {
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
}

/** Sun declination (deg) and equation of time (minutes) for a Julian day. */
function sunPosition(jd: number): { declination: number; equationOfTime: number } {
  const d = jd - 2451545.0;
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const l = (q + 1.915 * sind(g) + 0.02 * sind(2 * g)) % 360;
  const e = 23.439 - 0.00000036 * d;
  const declination = Math.asin(sind(e) * sind(l)) / DEG;
  const ra = Math.atan2(cosd(e) * sind(l), cosd(l)) / DEG / 15; // right ascension, hours
  const equationOfTime = q / 15 - fixHour(ra); // hours
  return { declination, equationOfTime };
}

export interface FajrOptions {
  angle?: number; // sun depression angle below horizon
  timezoneOffsetHours?: number; // defaults to the device's current offset
}

/**
 * Returns Fajr as local minutes-after-midnight for the given date & location,
 * or null if the sun never reaches the required depression (high latitudes).
 */
export function fajrMinutes(
  date: Date,
  latitude: number,
  longitude: number,
  opts: FajrOptions = {},
): number | null {
  const angle = opts.angle ?? 18;
  const tz = opts.timezoneOffsetHours ?? -date.getTimezoneOffset() / 60;

  const jd = julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const { declination, equationOfTime } = sunPosition(jd);

  // Hour-angle for the given depression angle.
  const cosT =
    (-sind(angle) - sind(declination) * sind(latitude)) / (cosd(declination) * cosd(latitude));
  if (cosT > 1 || cosT < -1) return null;

  // Hour angle (degrees) between Fajr and solar noon.
  const t = Math.acos(cosT) / DEG;
  // Solar noon (Dhuhr) in local hours, then step back by the hour angle.
  const noon = 12 - equationOfTime - longitude / 15 + tz;
  const fajr = noon - t / 15;

  return Math.round(fixHour(fajr) * 60);
}

/** A few Uzbek city coordinates for the setup picker. */
export const UZ_CITIES: Record<string, { lat: number; lon: number }> = {
  Tashkent: { lat: 41.3111, lon: 69.2797 },
  Samarkand: { lat: 39.627, lon: 66.975 },
  Bukhara: { lat: 39.767, lon: 64.421 },
  Namangan: { lat: 40.998, lon: 71.672 },
  Andijan: { lat: 40.783, lon: 72.344 },
  Nukus: { lat: 42.46, lon: 59.617 },
};
