import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Card, Row, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme';
import { useAlarmStore } from '@/store/alarmStore';
import { computeStreak, isoDate, longestStreak } from '@/features/alarm/logic';

const WEEK_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function HistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const history = useAlarmStore((s) => s.history);

  const outcomeByDate = useMemo(() => {
    const map = new Map<string, 'success' | 'failed'>();
    for (const r of history) {
      const existing = map.get(r.date);
      if (r.outcome === 'success') map.set(r.date, 'success');
      else if (!existing) map.set(r.date, 'failed');
    }
    return map;
  }, [history]);

  const streak = computeStreak(history);
  const best = longestStreak(history);

  // Build the current month grid.
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first offset.
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="h2">{t('alarm.history')}</AppText>
          <Pressable onPress={() => router.back()}>
            <AppText color={theme.textMuted}>{t('common.done')}</AppText>
          </Pressable>
        </Row>

        <Row style={{ gap: spacing.md }}>
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <AppText variant="display" color={theme.primary} style={{ fontSize: 40 }}>
              {streak}
            </AppText>
            <AppText color={theme.textMuted}>🔥 {t('home.streak')}</AppText>
          </Card>
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <AppText variant="display" style={{ fontSize: 40 }}>
              {best}
            </AppText>
            <AppText color={theme.textMuted}>🏆 max</AppText>
          </Card>
        </Row>

        <Card>
          <Row style={{ justifyContent: 'space-around', marginBottom: spacing.sm }}>
            {WEEK_LABELS.map((w) => (
              <AppText key={w} variant="caption" color={theme.textMuted} style={{ width: 36, textAlign: 'center' }}>
                {w}
              </AppText>
            ))}
          </Row>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {cells.map((day, i) => {
              if (day == null) return <View key={i} style={{ width: '14.28%', height: 44 }} />;
              const date = isoDate(new Date(year, month, day));
              const outcome = outcomeByDate.get(date);
              const isToday = date === isoDate(today);
              const bg =
                outcome === 'success'
                  ? theme.success
                  : outcome === 'failed'
                    ? theme.danger
                    : 'transparent';
              const fg = outcome ? theme.bg : theme.text;
              return (
                <View key={i} style={{ width: '14.28%', height: 44, alignItems: 'center' }}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: radius.pill,
                      backgroundColor: bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: isToday ? 2 : 0,
                      borderColor: theme.primary,
                    }}
                  >
                    <AppText variant="caption" color={fg}>
                      {day}
                    </AppText>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}
