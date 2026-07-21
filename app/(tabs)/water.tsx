import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Chip, ProgressBar, Row, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme';
import { useWaterStore } from '@/store/waterStore';
import { cancelScheduled, ensurePermissions, scheduleWaterReminders } from '@/lib/notifications';
import { isoDate } from '@/features/alarm/logic';
import { QUICK_ADD, totalForDate } from '@/features/water/logic';
import type { Activity, Climate } from '@/types';

const ACTIVITIES: Activity[] = ['low', 'moderate', 'high'];
const CLIMATES: Climate[] = ['temperate', 'hot'];
const INTERVALS = [60, 90, 120, 180];

export default function WaterTab() {
  const theme = useTheme();
  const { t } = useTranslation();

  const profile = useWaterStore((s) => s.profile);
  const setProfile = useWaterStore((s) => s.setProfile);
  const entries = useWaterStore((s) => s.entries);
  const addWater = useWaterStore((s) => s.addWater);
  const undoLast = useWaterStore((s) => s.undoLast);
  const goalMl = useWaterStore((s) => s.goalMl());
  const reminderInterval = useWaterStore((s) => s.reminderIntervalMin);
  const setReminderInterval = useWaterStore((s) => s.setReminderInterval);
  const reminderIds = useWaterStore((s) => s.reminderIds);
  const setReminderIds = useWaterStore((s) => s.setReminderIds);

  const [custom, setCustom] = useState('');

  const today = isoDate(new Date());
  const consumed = totalForDate(entries, today);
  const pct = goalMl > 0 ? consumed / goalMl : 0;
  const remaining = Math.max(0, goalMl - consumed);

  async function applyReminderInterval(min: number) {
    setReminderInterval(min);
    await ensurePermissions();
    await cancelScheduled(reminderIds);
    const ids = await scheduleWaterReminders(min);
    setReminderIds(ids);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <AppText variant="h1">{t('water.title')}</AppText>

        <Card style={{ alignItems: 'center' }}>
          <AppText variant="display" color={theme.water}>
            {consumed}
          </AppText>
          <AppText color={theme.textMuted}>
            {t('water.goal')}: {goalMl} мл
          </AppText>
          <View style={{ width: '100%', marginTop: spacing.lg }}>
            <ProgressBar value={pct} color={theme.water} />
          </View>
          <AppText style={{ marginTop: spacing.md }} color={pct >= 1 ? theme.success : theme.text}>
            {pct >= 1 ? t('water.goalReached') : t('water.remaining', { ml: remaining })}
          </AppText>
        </Card>

        {/* Quick add */}
        <Row style={{ gap: spacing.md }}>
          {QUICK_ADD.map((q) => (
            <Card key={q.key} style={{ flex: 1, alignItems: 'center' }} onPress={() => addWater(q.ml)}>
              <AppText variant="h2">{q.ml === 500 ? '🍶' : q.ml === 350 ? '☕' : '🥛'}</AppText>
              <AppText variant="label">{q.ml} мл</AppText>
            </Card>
          ))}
        </Row>

        {/* Custom */}
        <Card>
          <AppText variant="label" color={theme.textMuted}>
            {t('water.custom')}
          </AppText>
          <Row style={{ marginTop: spacing.sm }}>
            <TextInput
              value={custom}
              onChangeText={setCustom}
              keyboardType="number-pad"
              placeholder="мл"
              placeholderTextColor={theme.textMuted}
              style={{
                flex: 1,
                color: theme.text,
                fontSize: 18,
                backgroundColor: theme.surfaceAlt,
                borderRadius: radius.md,
                padding: spacing.md,
              }}
            />
            <Button
              title="+"
              onPress={() => {
                const v = parseInt(custom, 10);
                if (v > 0) {
                  addWater(v);
                  setCustom('');
                }
              }}
            />
          </Row>
          <Button
            title={t('water.undo')}
            variant="ghost"
            onPress={() => undoLast(today)}
            style={{ marginTop: spacing.sm }}
          />
        </Card>

        {/* Reminders */}
        <Card>
          <AppText variant="label" color={theme.textMuted}>
            {t('water.reminders')}
          </AppText>
          <Row style={{ marginTop: spacing.md, gap: spacing.sm }}>
            {INTERVALS.map((min) => (
              <Chip
                key={min}
                label={t('water.every', { hours: min / 60 })}
                active={reminderInterval === min}
                onPress={() => applyReminderInterval(min)}
              />
            ))}
          </Row>
        </Card>

        {/* Profile */}
        <Card>
          <AppText variant="label" color={theme.textMuted}>
            {t('water.profile')}
          </AppText>
          <Row style={{ marginTop: spacing.md, justifyContent: 'space-between' }}>
            <AppText>{t('water.weight')}</AppText>
            <Row>
              <Button
                title="−"
                variant="secondary"
                onPress={() => setProfile({ ...profile, weightKg: Math.max(30, profile.weightKg - 1) })}
              />
              <AppText variant="h3" style={{ width: 48, textAlign: 'center' }}>
                {profile.weightKg}
              </AppText>
              <Button
                title="+"
                variant="secondary"
                onPress={() => setProfile({ ...profile, weightKg: Math.min(200, profile.weightKg + 1) })}
              />
            </Row>
          </Row>

          <AppText style={{ marginTop: spacing.md }}>{t('water.activity')}</AppText>
          <Row style={{ marginTop: spacing.sm, gap: spacing.sm }}>
            {ACTIVITIES.map((a) => (
              <Chip
                key={a}
                label={t(`water.activityLevels.${a}`)}
                active={profile.activity === a}
                onPress={() => setProfile({ ...profile, activity: a })}
              />
            ))}
          </Row>

          <AppText style={{ marginTop: spacing.md }}>{t('water.climate')}</AppText>
          <Row style={{ marginTop: spacing.sm, gap: spacing.sm }}>
            {CLIMATES.map((c) => (
              <Chip
                key={c}
                label={t(`water.climates.${c}`)}
                active={profile.climate === c}
                onPress={() => setProfile({ ...profile, climate: c })}
              />
            ))}
          </Row>
        </Card>
      </ScrollView>
    </Screen>
  );
}
