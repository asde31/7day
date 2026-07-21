import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Chip, Row, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme';
import { useNutritionStore } from '@/store/nutritionStore';
import { dailyTargets } from '@/features/nutrition/logic';
import type { Activity, Goal, NutritionProfile, Sex } from '@/types';

const ACTIVITIES: Activity[] = ['low', 'moderate', 'high'];
const GOALS: Goal[] = ['lose', 'maintain', 'gain'];

export default function NutritionProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const stored = useNutritionStore((s) => s.profile);
  const setProfile = useNutritionStore((s) => s.setProfile);

  const [p, setP] = useState<NutritionProfile>(stored);
  const target = dailyTargets(p);

  function patch(next: Partial<NutritionProfile>) {
    setP((prev) => ({ ...prev, ...next }));
  }

  function save() {
    setProfile(p);
    router.back();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="h2">{t('nutrition.profile.title')}</AppText>
          <Pressable onPress={() => router.back()}>
            <AppText color={theme.textMuted}>{t('common.cancel')}</AppText>
          </Pressable>
        </Row>

        {/* Live target */}
        <Card style={{ backgroundColor: theme.accent, alignItems: 'center' }}>
          <AppText variant="display" color="#fff">
            {target.kcal}
          </AppText>
          <AppText color="#fff" style={{ opacity: 0.9 }}>
            {t('nutrition.profile.yourTarget')} · {t('nutrition.kcal')}
          </AppText>
          <Row style={{ marginTop: spacing.sm, gap: spacing.lg }}>
            <AppText color="#fff">Б {target.protein}г</AppText>
            <AppText color="#fff">Ж {target.fat}г</AppText>
            <AppText color="#fff">У {target.carbs}г</AppText>
          </Row>
        </Card>

        <Card>
          {/* Sex */}
          <AppText variant="label" color={theme.textMuted}>
            {t('nutrition.profile.sex')}
          </AppText>
          <Row style={{ marginTop: spacing.sm, gap: spacing.sm }}>
            {(['male', 'female'] as Sex[]).map((sx) => (
              <Chip
                key={sx}
                label={t(`nutrition.profile.${sx}`)}
                active={p.sex === sx}
                onPress={() => patch({ sex: sx })}
              />
            ))}
          </Row>

          <Stepper
            label={t('nutrition.profile.age')}
            value={p.age}
            onChange={(v) => patch({ age: clamp(v, 12, 100) })}
            theme={theme}
          />
          <Stepper
            label={t('nutrition.profile.height')}
            value={p.heightCm}
            step={1}
            onChange={(v) => patch({ heightCm: clamp(v, 120, 230) })}
            theme={theme}
          />
          <Stepper
            label={t('nutrition.profile.weight')}
            value={p.weightKg}
            step={1}
            onChange={(v) => patch({ weightKg: clamp(v, 30, 250) })}
            theme={theme}
          />
        </Card>

        <Card>
          <AppText variant="label" color={theme.textMuted}>
            {t('nutrition.profile.activity')}
          </AppText>
          <Row style={{ marginTop: spacing.sm, gap: spacing.sm }}>
            {ACTIVITIES.map((a) => (
              <Chip
                key={a}
                label={t(`water.activityLevels.${a}`)}
                active={p.activity === a}
                onPress={() => patch({ activity: a })}
              />
            ))}
          </Row>

          <AppText variant="label" color={theme.textMuted} style={{ marginTop: spacing.md }}>
            {t('nutrition.profile.goal')}
          </AppText>
          <Row style={{ marginTop: spacing.sm, gap: spacing.sm }}>
            {GOALS.map((g) => (
              <Chip
                key={g}
                label={t(`nutrition.profile.goals.${g}`)}
                active={p.goal === g}
                onPress={() => patch({ goal: g })}
              />
            ))}
          </Row>
        </Card>

        <Button title={t('nutrition.profile.save')} onPress={save} />
      </ScrollView>
    </Screen>
  );
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function Stepper({
  label,
  value,
  onChange,
  step = 1,
  theme,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  theme: { text: string };
}) {
  return (
    <Row style={{ justifyContent: 'space-between', marginTop: spacing.md }}>
      <AppText>{label}</AppText>
      <Row>
        <Button title="−" variant="secondary" onPress={() => onChange(value - step)} />
        <AppText variant="h3" style={{ width: 56, textAlign: 'center' }}>
          {value}
        </AppText>
        <Button title="+" variant="secondary" onPress={() => onChange(value + step)} />
      </Row>
    </Row>
  );
}
