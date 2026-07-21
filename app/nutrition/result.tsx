import { useMemo, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Chip, Row, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme';
import { useNutritionStore } from '@/store/nutritionStore';
import { MEAL_TYPES, mealTypeForHour, scaleMacros } from '@/features/nutrition/logic';
import type { MealType, RecognizedFood } from '@/types';

interface EditableItem {
  name: string;
  grams: number;
  baseGrams: number;
  baseMacros: RecognizedFood['macros'];
  confidence: number;
}

export default function ResultScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { items: itemsParam } = useLocalSearchParams<{ items: string }>();
  const addMeal = useNutritionStore((s) => s.addMeal);

  const parsed = useMemo<RecognizedFood[]>(() => {
    try {
      return JSON.parse(itemsParam ?? '[]');
    } catch {
      return [];
    }
  }, [itemsParam]);

  const [items, setItems] = useState<EditableItem[]>(
    parsed.map((i) => ({
      name: i.name,
      grams: i.grams,
      baseGrams: i.grams || 1,
      baseMacros: i.macros,
      confidence: i.confidence,
    })),
  );
  const [mealType, setMealType] = useState<MealType>(mealTypeForHour(new Date().getHours()));

  function update(index: number, patch: Partial<EditableItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function save() {
    for (const it of items) {
      addMeal({
        mealType,
        name: it.name.trim() || '—',
        grams: it.grams,
        macros: scaleMacros(it.baseMacros, it.baseGrams, it.grams),
        source: 'ai_photo',
      });
    }
    router.dismissAll?.();
    router.replace('/nutrition');
  }

  if (parsed.length === 0) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.lg }}>
          <AppText variant="h3" style={{ textAlign: 'center' }}>
            {t('nutrition.scanScreen.nothingFound')}
          </AppText>
          <Button title={t('common.done')} onPress={() => router.replace('/nutrition')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <AppText variant="h2">{t('nutrition.result.title')}</AppText>
        <AppText color={theme.textMuted}>{t('nutrition.result.editHint')}</AppText>

        {/* Meal slot */}
        <Row style={{ flexWrap: 'wrap', gap: spacing.sm }}>
          {MEAL_TYPES.map((mt) => (
            <Chip
              key={mt}
              label={t(`nutrition.meals.${mt}`)}
              active={mealType === mt}
              onPress={() => setMealType(mt)}
            />
          ))}
        </Row>

        {items.map((it, i) => {
          const macros = scaleMacros(it.baseMacros, it.baseGrams, it.grams);
          return (
            <Card key={i}>
              {it.confidence < 0.5 && (
                <AppText variant="caption" color={theme.warning}>
                  ⚠️ {t('nutrition.result.lowConfidence')}
                </AppText>
              )}
              <AppText variant="label" color={theme.textMuted} style={{ marginTop: spacing.xs }}>
                {t('nutrition.result.name')}
              </AppText>
              <TextInput
                value={it.name}
                onChangeText={(v) => update(i, { name: v })}
                style={{
                  color: theme.text,
                  fontSize: 18,
                  backgroundColor: theme.surfaceAlt,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginTop: spacing.xs,
                }}
              />

              <Row style={{ marginTop: spacing.md, justifyContent: 'space-between' }}>
                <AppText>{t('nutrition.result.portion')}</AppText>
                <Row>
                  <Button
                    title="−10"
                    variant="secondary"
                    onPress={() => update(i, { grams: Math.max(0, it.grams - 10) })}
                  />
                  <AppText variant="h3" style={{ width: 64, textAlign: 'center' }}>
                    {it.grams}
                  </AppText>
                  <Button title="+10" variant="secondary" onPress={() => update(i, { grams: it.grams + 10 })} />
                </Row>
              </Row>

              <Row style={{ marginTop: spacing.md, justifyContent: 'space-around' }}>
                <Metric value={macros.kcal} label={t('nutrition.kcal')} theme={theme} />
                <Metric value={macros.protein} label={t('nutrition.protein')} theme={theme} />
                <Metric value={macros.fat} label={t('nutrition.fat')} theme={theme} />
                <Metric value={macros.carbs} label={t('nutrition.carbs')} theme={theme} />
              </Row>
            </Card>
          );
        })}

        <Button title={t('nutrition.result.save')} onPress={save} />
        <Button title={t('common.cancel')} variant="ghost" onPress={() => router.replace('/nutrition')} />
      </ScrollView>
    </Screen>
  );
}

function Metric({ value, label, theme }: { value: number; label: string; theme: { textMuted: string } }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <AppText variant="h3">{value}</AppText>
      <AppText variant="caption" color={theme.textMuted}>
        {label}
      </AppText>
    </View>
  );
}
