import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme';
import { useAlarmStore } from '@/store/alarmStore';
import { MissionRunner } from '@/features/missions/MissionRunner';
import { formatTime } from '@/features/alarm/logic';
import { defaultMission } from '@/features/missions/logic';

const SNOOZE_MINUTES = 5;

export default function RingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { alarmId } = useLocalSearchParams<{ alarmId: string }>();

  const alarm = useAlarmStore((s) => s.alarms.find((a) => a.id === alarmId));
  const recordWake = useAlarmStore((s) => s.recordWake);

  const [now, setNow] = useState(new Date());
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const mission = alarm?.mission ?? defaultMission();
  const snoozeLocked = alarm?.snoozeLocked ?? true;

  function onMissionComplete() {
    setCompleted(true);
    if (alarm) recordWake(alarm.id, 'success', mission.type);
    setTimeout(() => router.back(), 900);
  }

  function onSnooze() {
    if (snoozeLocked && !completed) return; // snooze is blocked until the mission is done
    if (alarm) recordWake(alarm.id, 'snoozed', mission.type);
    router.back();
  }

  const currentClock = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes(),
  ).padStart(2, '0')}`;

  return (
    <Screen style={{ backgroundColor: theme.bg }}>
      <View style={{ flex: 1, padding: spacing.lg, justifyContent: 'center', gap: spacing.xl }}>
        <View style={{ alignItems: 'center' }}>
          <AppText variant="display" style={{ fontSize: 64 }}>
            {currentClock}
          </AppText>
          <AppText variant="h2" color={theme.primary}>
            {alarm?.label || t('alarm.ring.title')}
          </AppText>
          {alarm && (
            <AppText color={theme.textMuted}>{formatTime(alarm.timeMinutes)}</AppText>
          )}
        </View>

        {completed ? (
          <AppText variant="h2" color={theme.success} style={{ textAlign: 'center' }}>
            {t('alarm.missionScreen.success')}
          </AppText>
        ) : (
          <>
            <AppText color={theme.textMuted} style={{ textAlign: 'center' }}>
              {t('alarm.ring.solveToStop')}
            </AppText>
            <MissionRunner mission={mission} onComplete={onMissionComplete} />
          </>
        )}

        <View style={{ alignItems: 'center' }}>
          {snoozeLocked && !completed ? (
            <AppText variant="caption" color={theme.warning}>
              🔒 {t('alarm.ring.snoozeBlocked')}
            </AppText>
          ) : (
            <Button title={t('alarm.ring.snooze')} variant="ghost" onPress={onSnooze} />
          )}
        </View>
      </View>
    </Screen>
  );
}

export { SNOOZE_MINUTES };
