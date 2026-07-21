import { useState } from 'react';
import { Pressable, ScrollView, Switch, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Chip, Row, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme';
import { useAlarmStore } from '@/store/alarmStore';
import { ensurePermissions } from '@/lib/notifications';
import { formatTime } from '@/features/alarm/logic';
import { defaultStepCount } from '@/features/missions/logic';
import { fajrMinutes, UZ_CITIES } from '@/features/alarm/fajr';
import type { MissionDifficulty, MissionType, Weekday } from '@/types';

const DAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MISSION_TYPES: MissionType[] = ['math', 'steps', 'affirmation', 'photo'];
const DIFFICULTIES: MissionDifficulty[] = ['easy', 'medium', 'hard'];

export default function NewAlarm() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const addAlarm = useAlarmStore((s) => s.addAlarm);

  const [timeMinutes, setTimeMinutes] = useState(6 * 60); // default 06:00
  const [label, setLabel] = useState('');
  const [repeatDays, setRepeatDays] = useState<Weekday[]>([1, 2, 3, 4, 5]);
  const [missionType, setMissionType] = useState<MissionType>('math');
  const [difficulty, setDifficulty] = useState<MissionDifficulty>('medium');
  const [phrase, setPhrase] = useState('Сегодня будет отличный день');
  const [snoozeLocked, setSnoozeLocked] = useState(true);
  const [fajrLinked, setFajrLinked] = useState(false);
  const [city, setCity] = useState<keyof typeof UZ_CITIES>('Tashkent');
  const [saving, setSaving] = useState(false);

  function step(deltaMin: number) {
    setTimeMinutes((m) => (m + deltaMin + 1440) % 1440);
  }

  function toggleDay(day: Weekday) {
    setRepeatDays((days) =>
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day],
    );
  }

  function applyFajr(nextCity: keyof typeof UZ_CITIES) {
    const { lat, lon } = UZ_CITIES[nextCity];
    const minutes = fajrMinutes(new Date(), lat, lon);
    if (minutes != null) setTimeMinutes(minutes);
  }

  async function onSave() {
    setSaving(true);
    await ensurePermissions();
    await addAlarm({
      label,
      timeMinutes,
      repeatDays,
      enabled: true,
      snoozeLocked,
      fajrLinked,
      mission: {
        type: missionType,
        difficulty,
        stepCount: missionType === 'steps' ? defaultStepCount(difficulty) : undefined,
        phrase: missionType === 'affirmation' ? phrase : undefined,
      },
    });
    router.back();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="h2">{t('alarm.add')}</AppText>
          <Pressable onPress={() => router.back()}>
            <AppText color={theme.textMuted}>{t('common.cancel')}</AppText>
          </Pressable>
        </Row>

        {/* Time stepper */}
        <Card>
          <AppText variant="label" color={theme.textMuted}>
            {t('alarm.time')}
          </AppText>
          <Row style={{ justifyContent: 'center', gap: spacing.xl, marginTop: spacing.md }}>
            <Stepper label="−1ч" onPress={() => step(-60)} theme={theme} />
            <Stepper label="−5м" onPress={() => step(-5)} theme={theme} />
            <AppText variant="display" style={{ fontSize: 52 }}>
              {formatTime(timeMinutes)}
            </AppText>
            <Stepper label="+5м" onPress={() => step(5)} theme={theme} />
            <Stepper label="+1ч" onPress={() => step(60)} theme={theme} />
          </Row>
        </Card>

        {/* Label */}
        <Card>
          <AppText variant="label" color={theme.textMuted}>
            {t('alarm.label')}
          </AppText>
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder={t('alarm.labelPlaceholder')}
            placeholderTextColor={theme.textMuted}
            style={{
              color: theme.text,
              fontSize: 18,
              marginTop: spacing.sm,
              paddingVertical: spacing.sm,
            }}
          />
        </Card>

        {/* Repeat */}
        <Card>
          <AppText variant="label" color={theme.textMuted}>
            {t('alarm.repeat')}
          </AppText>
          <Row style={{ marginTop: spacing.md, flexWrap: 'wrap', gap: spacing.sm }}>
            {DAY_LABELS.map((lbl, i) => (
              <Chip
                key={i}
                label={lbl}
                active={repeatDays.includes(i as Weekday)}
                onPress={() => toggleDay(i as Weekday)}
              />
            ))}
          </Row>
        </Card>

        {/* Mission */}
        <Card>
          <AppText variant="label" color={theme.textMuted}>
            {t('alarm.mission')}
          </AppText>
          <Row style={{ marginTop: spacing.md, flexWrap: 'wrap', gap: spacing.sm }}>
            {MISSION_TYPES.map((m) => (
              <Chip
                key={m}
                label={t(`alarm.missions.${m}`)}
                active={missionType === m}
                onPress={() => setMissionType(m)}
              />
            ))}
          </Row>

          <Row style={{ marginTop: spacing.md, gap: spacing.sm }}>
            {DIFFICULTIES.map((d) => (
              <Chip
                key={d}
                label={t(`alarm.difficulty.${d}`)}
                active={difficulty === d}
                onPress={() => setDifficulty(d)}
              />
            ))}
          </Row>

          {missionType === 'affirmation' && (
            <TextInput
              value={phrase}
              onChangeText={setPhrase}
              style={{
                color: theme.text,
                fontSize: 16,
                marginTop: spacing.md,
                backgroundColor: theme.surfaceAlt,
                borderRadius: radius.md,
                padding: spacing.md,
              }}
            />
          )}
          {missionType === 'steps' && (
            <AppText color={theme.textMuted} style={{ marginTop: spacing.md }}>
              {t('alarm.missions.stepsDesc', { count: defaultStepCount(difficulty) })}
            </AppText>
          )}
        </Card>

        {/* Options */}
        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText style={{ flex: 1 }}>{t('alarm.snoozeLock')}</AppText>
            <Switch
              value={snoozeLocked}
              onValueChange={setSnoozeLocked}
              trackColor={{ true: theme.primary, false: theme.surfaceAlt }}
            />
          </Row>
          <Row style={{ justifyContent: 'space-between', marginTop: spacing.md }}>
            <AppText style={{ flex: 1 }}>🕌 {t('alarm.fajr')}</AppText>
            <Switch
              value={fajrLinked}
              onValueChange={(v) => {
                setFajrLinked(v);
                if (v) applyFajr(city);
              }}
              trackColor={{ true: theme.accent, false: theme.surfaceAlt }}
            />
          </Row>
          {fajrLinked && (
            <Row style={{ marginTop: spacing.md, flexWrap: 'wrap', gap: spacing.sm }}>
              {Object.keys(UZ_CITIES).map((c) => (
                <Chip
                  key={c}
                  label={c}
                  active={city === c}
                  onPress={() => {
                    setCity(c as keyof typeof UZ_CITIES);
                    applyFajr(c as keyof typeof UZ_CITIES);
                  }}
                />
              ))}
            </Row>
          )}
        </Card>

        <Button title={t('common.save')} onPress={onSave} loading={saving} />
      </ScrollView>
    </Screen>
  );
}

function Stepper({
  label,
  onPress,
  theme,
}: {
  label: string;
  onPress: () => void;
  theme: { surfaceAlt: string; text: string };
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.surfaceAlt,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
      }}
    >
      <AppText variant="caption">{label}</AppText>
    </Pressable>
  );
}
