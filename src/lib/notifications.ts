import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Alarm, Weekday } from '@/types';

/**
 * Local-notification layer for alarms and water reminders. Everything here is
 * offline-capable: expo-notifications schedules against the OS, so alarms fire
 * without a network connection.
 *
 * NOTE on Android reliability: a JS-scheduled notification is best-effort. For
 * a production-grade "cannot be missed" alarm we add a native full-screen
 * intent + foreground service via a config plugin / prebuild (see
 * docs/ARCHITECTURE.md → "Android alarm reliability"). This module is the
 * cross-platform baseline that the native layer upgrades.
 */

export const ALARM_CHANNEL_ID = 'alarms';
export const WATER_CHANNEL_ID = 'water';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensurePermissions(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  let granted =
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!granted) {
    const req = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
    granted = req.granted;
  }
  return granted;
}

export async function setupChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
    name: 'Будильник',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 400, 250, 400],
    bypassDnd: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
  await Notifications.setNotificationChannelAsync(WATER_CHANNEL_ID, {
    name: 'Вода',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

/** expo-notifications uses 1 = Sunday … 7 = Saturday for weekly triggers. */
function toExpoWeekday(day: Weekday): number {
  return day + 1;
}

/**
 * Schedule all OS notifications for one alarm and return their identifiers so
 * they can be cancelled later. A repeating alarm produces one weekly trigger
 * per selected day; a one-shot produces a single dated trigger.
 */
export async function scheduleAlarm(alarm: Alarm): Promise<string[]> {
  const hour = Math.floor(alarm.timeMinutes / 60);
  const minute = alarm.timeMinutes % 60;
  const content: Notifications.NotificationContentInput = {
    title: alarm.label || 'Пора вставать ☀️',
    body: 'Выполни миссию, чтобы отключить будильник.',
    sound: 'default',
    priority: Notifications.AndroidNotificationPriority.MAX,
    data: { alarmId: alarm.id, kind: 'alarm' },
    categoryIdentifier: 'alarm',
  };

  const ids: string[] = [];

  if (alarm.repeatDays.length === 0) {
    // A one-shot alarm still uses a daily trigger; the ring flow disables the
    // alarm after it fires so it does not repeat.
    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: { hour, minute, repeats: true, channelId: ALARM_CHANNEL_ID },
    });
    ids.push(id);
    return ids;
  }

  for (const day of alarm.repeatDays) {
    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        weekday: toExpoWeekday(day),
        hour,
        minute,
        repeats: true,
        channelId: ALARM_CHANNEL_ID,
      },
    });
    ids.push(id);
  }
  return ids;
}

export async function cancelScheduled(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)),
  );
}

/**
 * Schedule water reminders every `intervalMinutes` between `startHour` and
 * `endHour`. Returns the created identifiers.
 */
export async function scheduleWaterReminders(
  intervalMinutes: number,
  startHour = 9,
  endHour = 22,
): Promise<string[]> {
  const ids: string[] = [];
  for (let m = startHour * 60; m <= endHour * 60; m += intervalMinutes) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Время воды 💧',
        body: 'Сделай глоток — до нормы ещё немного.',
        data: { kind: 'water' },
      },
      trigger: {
        hour: Math.floor(m / 60),
        minute: m % 60,
        repeats: true,
        channelId: WATER_CHANNEL_ID,
      },
    });
    ids.push(id);
  }
  return ids;
}
