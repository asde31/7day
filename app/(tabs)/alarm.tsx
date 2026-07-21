import { ScrollView, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Row, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme';
import { useAlarmStore } from '@/store/alarmStore';
import { formatTime } from '@/features/alarm/logic';
import type { Weekday } from '@/types';

const DAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function repeatSummary(days: Weekday[], t: (k: string) => string): string {
  if (days.length === 0) return t('alarm.once');
  if (days.length === 7) return t('alarm.everyday');
  const weekdaySet = [1, 2, 3, 4, 5];
  if (days.length === 5 && weekdaySet.every((d) => days.includes(d as Weekday)))
    return t('alarm.weekdays');
  return days
    .slice()
    .sort()
    .map((d) => DAY_LABELS[d])
    .join(', ');
}

export default function AlarmTab() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const alarms = useAlarmStore((s) => s.alarms);
  const toggleAlarm = useAlarmStore((s) => s.toggleAlarm);
  const removeAlarm = useAlarmStore((s) => s.removeAlarm);

  return (
    <Screen>
      <View style={{ padding: spacing.lg, gap: spacing.md, flex: 1 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="h1">{t('alarm.title')}</AppText>
          <Button title={`+ ${t('alarm.add')}`} onPress={() => router.push('/alarm/new')} />
        </Row>

        {alarms.length === 0 ? (
          <Card>
            <AppText color={theme.textMuted}>{t('alarm.empty')}</AppText>
          </Card>
        ) : (
          <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
            {alarms.map((alarm) => (
              <Card key={alarm.id}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="display" style={{ fontSize: 40 }}>
                      {formatTime(alarm.timeMinutes)}
                    </AppText>
                    <AppText color={theme.textMuted}>
                      {alarm.label || t('alarm.labelPlaceholder')} ·{' '}
                      {repeatSummary(alarm.repeatDays, t)}
                    </AppText>
                    <Row style={{ marginTop: spacing.sm }}>
                      <AppText variant="caption" color={theme.primary}>
                        🎯 {t(`alarm.missions.${alarm.mission.type}`)}
                      </AppText>
                      {alarm.fajrLinked && (
                        <AppText variant="caption" color={theme.accent}>
                          · 🕌 Fajr
                        </AppText>
                      )}
                      {alarm.snoozeLocked && (
                        <AppText variant="caption" color={theme.warning}>
                          · 🔒
                        </AppText>
                      )}
                    </Row>
                  </View>
                  <Switch
                    value={alarm.enabled}
                    onValueChange={(v) => toggleAlarm(alarm.id, v)}
                    trackColor={{ true: theme.primary, false: theme.surfaceAlt }}
                  />
                </Row>
                <Row style={{ marginTop: spacing.md, justifyContent: 'flex-end' }}>
                  <Button
                    title={t('common.delete')}
                    variant="ghost"
                    onPress={() => removeAlarm(alarm.id)}
                  />
                </Row>
              </Card>
            ))}

            <Button
              title={t('alarm.history')}
              variant="secondary"
              onPress={() => router.push('/alarm/history')}
            />
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}
