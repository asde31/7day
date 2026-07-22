import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, ProgressBar, Row, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme';
import { useAlarmStore } from '@/store/alarmStore';
import { useWaterStore } from '@/store/waterStore';
import { computeStreak, formatTime, isoDate, nextOccurrence, timeUntil } from '@/features/alarm/logic';
import { progress, totalForDate } from '@/features/water/logic';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const alarms = useAlarmStore((s) => s.alarms);
  const history = useAlarmStore((s) => s.history);
  const waterEntries = useWaterStore((s) => s.entries);
  const goalMl = useWaterStore((s) => s.goalMl());

  const streak = useMemo(() => computeStreak(history), [history]);
  const today = isoDate(new Date());
  const waterToday = totalForDate(waterEntries, today);
  const waterProgress = progress(waterEntries, today, goalMl);

  const next = useMemo(() => {
    const enabled = alarms.filter((a) => a.enabled);
    if (enabled.length === 0) return null;
    const sorted = enabled
      .map((a) => ({ alarm: a, when: nextOccurrence(a) }))
      .sort((x, y) => x.when.getTime() - y.when.getTime());
    return sorted[0];
  }, [alarms]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t('home.greetingMorning') : hour < 18 ? t('home.greetingDay') : t('home.greetingEvening');

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <AppText variant="h1">{greeting} 👋</AppText>

        {/* Streak */}
        <Card style={{ backgroundColor: theme.accent }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View>
              <AppText variant="display" color="#fff">
                {streak}
              </AppText>
              <AppText color="#fff" style={{ opacity: 0.9 }}>
                🔥 {t('home.streak')}
              </AppText>
            </View>
            <AppText variant="display">{streak > 0 ? '🔥' : '🌱'}</AppText>
          </Row>
        </Card>

        {/* Next alarm */}
        <Card onPress={() => router.push('/alarm')}>
          <AppText variant="label" color={theme.textMuted}>
            {t('home.nextAlarm')}
          </AppText>
          {next ? (
            <Row style={{ justifyContent: 'space-between', marginTop: spacing.sm }}>
              <AppText variant="h1">{formatTime(next.alarm.timeMinutes)}</AppText>
              <AppText color={theme.textMuted}>
                {(() => {
                  const u = timeUntil(next.when);
                  return t('home.inHours', { hours: u.hours, minutes: u.minutes });
                })()}
              </AppText>
            </Row>
          ) : (
            <AppText style={{ marginTop: spacing.sm }} color={theme.textMuted}>
              {t('home.noAlarm')}
            </AppText>
          )}
        </Card>

        {/* Water */}
        <Card onPress={() => router.push('/water')}>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="label" color={theme.textMuted}>
              💧 {t('home.waterToday')}
            </AppText>
            <AppText variant="label">
              {waterToday} / {goalMl} мл
            </AppText>
          </Row>
          <View style={{ marginTop: spacing.md }}>
            <ProgressBar value={waterProgress} color={theme.water} />
          </View>
        </Card>

        {/* Workouts */}
        <Card onPress={() => router.push('/fitness')} style={{ backgroundColor: theme.surfaceAlt }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <AppText variant="h3">🏋️ {t('home.workouts')}</AppText>
              <AppText variant="caption" color={theme.textMuted} style={{ marginTop: spacing.xs }}>
                {t('home.workoutsSub')}
              </AppText>
            </View>
            <AppText variant="h2">›</AppText>
          </Row>
        </Card>

        {/* Breathing shortcuts */}
        <Row style={{ gap: spacing.md }}>
          <Button
            title={t('home.quickBreath')}
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => router.push('/breathing/box')}
          />
          <Button
            title={t('home.sos')}
            variant="danger"
            style={{ flex: 1 }}
            onPress={() => router.push('/breathing/sos')}
          />
        </Row>
      </ScrollView>
    </Screen>
  );
}
