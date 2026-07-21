import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, ProgressBar, Row, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme';
import { useNutritionStore } from '@/store/nutritionStore';
import { isoDate } from '@/features/alarm/logic';
import { MEAL_TYPES, dailyTotals } from '@/features/nutrition/logic';
import type { MealType } from '@/types';

export default function NutritionTab() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const entries = useNutritionStore((s) => s.entries);
  const removeMeal = useNutritionStore((s) => s.removeMeal);
  const targets = useNutritionStore((s) => s.targets());

  const today = isoDate(new Date());
  const totals = useMemo(() => dailyTotals(entries, today), [entries, today]);
  const todays = useMemo(() => entries.filter((e) => e.date === today), [entries, today]);

  const pct = targets.kcal > 0 ? totals.kcal / targets.kcal : 0;
  const diff = targets.kcal - totals.kcal;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="h1">{t('nutrition.title')}</AppText>
          <Button
            title="⚙︎"
            variant="secondary"
            onPress={() => router.push('/nutrition/profile')}
          />
        </Row>

        {/* Daily summary */}
        <Card style={{ alignItems: 'center' }}>
          <AppText variant="display" color={theme.primary}>
            {totals.kcal}
          </AppText>
          <AppText color={theme.textMuted}>
            {t('nutrition.goal')}: {targets.kcal} {t('nutrition.kcal')}
          </AppText>
          <View style={{ width: '100%', marginTop: spacing.md }}>
            <ProgressBar value={pct} color={pct > 1 ? theme.danger : theme.primary} />
          </View>
          <AppText style={{ marginTop: spacing.sm }} color={diff < 0 ? theme.danger : theme.text}>
            {diff >= 0
              ? t('nutrition.remaining', { kcal: diff })
              : t('nutrition.over', { kcal: -diff })}
          </AppText>

          {/* Macros */}
          <Row style={{ marginTop: spacing.lg, gap: spacing.lg }}>
            <Macro label={t('nutrition.protein')} value={totals.protein} target={targets.protein} theme={theme} />
            <Macro label={t('nutrition.fat')} value={totals.fat} target={targets.fat} theme={theme} />
            <Macro label={t('nutrition.carbs')} value={totals.carbs} target={targets.carbs} theme={theme} />
          </Row>
        </Card>

        {/* Actions */}
        <Row style={{ gap: spacing.md }}>
          <Button title={t('nutrition.scan')} style={{ flex: 1 }} onPress={() => router.push('/nutrition/scan')} />
        </Row>

        {/* Diary by meal */}
        {todays.length === 0 ? (
          <Card>
            <AppText color={theme.textMuted}>{t('nutrition.empty')}</AppText>
          </Card>
        ) : (
          MEAL_TYPES.map((mt) => {
            const rows = todays.filter((e) => e.mealType === mt);
            if (rows.length === 0) return null;
            return (
              <Card key={mt}>
                <AppText variant="label" color={theme.textMuted}>
                  {t(`nutrition.meals.${mt as MealType}`)}
                </AppText>
                {rows.map((e) => (
                  <Row key={e.id} style={{ justifyContent: 'space-between', marginTop: spacing.md }}>
                    <View style={{ flex: 1 }}>
                      <AppText>{e.name}</AppText>
                      <AppText variant="caption" color={theme.textMuted}>
                        {e.grams} г · {e.macros.kcal} {t('nutrition.kcal')}
                        {e.source === 'ai_photo' ? ' · 📷' : ''}
                      </AppText>
                    </View>
                    <Button title="✕" variant="ghost" onPress={() => removeMeal(e.id)} />
                  </Row>
                ))}
              </Card>
            );
          })
        )}

        {/* Disclaimer */}
        <Card style={{ backgroundColor: theme.surfaceAlt }}>
          <AppText variant="caption" color={theme.textMuted}>
            ⚠️ {t('nutrition.disclaimer')}
          </AppText>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function Macro({
  label,
  value,
  target,
  theme,
}: {
  label: string;
  value: number;
  target: number;
  theme: { textMuted: string };
}) {
  return (
    <View style={{ alignItems: 'center', minWidth: 72 }}>
      <AppText variant="h3">{value}</AppText>
      <AppText variant="caption" color={theme.textMuted}>
        {label}
      </AppText>
      <AppText variant="caption" color={theme.textMuted}>
        / {target}г
      </AppText>
    </View>
  );
}
