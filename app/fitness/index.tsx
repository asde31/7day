import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Card, Chip, Row, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme';
import { useFitnessStore } from '@/store/fitnessStore';
import { CATEGORIES, filterWorkouts } from '@/features/fitness/logic';
import type { WorkoutCategory } from '@/types';

export default function FitnessLibrary() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const workouts = useFitnessStore((s) => s.workouts);
  const isAdmin = useFitnessStore((s) => s.isAdmin);

  const [category, setCategory] = useState<WorkoutCategory | undefined>(undefined);
  const list = useMemo(() => filterWorkouts(workouts, { category }), [workouts, category]);

  return (
    <Screen>
      <View style={{ padding: spacing.lg, gap: spacing.md, flex: 1 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Pressable onPress={() => router.back()}>
            <AppText color={theme.textMuted}>‹</AppText>
          </Pressable>
          <AppText variant="h2">{t('fitness.title')}</AppText>
          {isAdmin ? (
            <Pressable onPress={() => router.push('/fitness/admin')}>
              <AppText color={theme.primary}>{t('fitness.admin.add')}</AppText>
            </Pressable>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </Row>

        {/* Category filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Row style={{ gap: spacing.sm }}>
            <Chip label={t('fitness.all')} active={!category} onPress={() => setCategory(undefined)} />
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={t(`fitness.categories.${c}`)}
                active={category === c}
                onPress={() => setCategory(c)}
              />
            ))}
          </Row>
        </ScrollView>

        {list.length === 0 ? (
          <Card>
            <AppText color={theme.textMuted}>{t('fitness.empty')}</AppText>
          </Card>
        ) : (
          <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
            {list.map((w) => (
              <Card key={w.id} style={{ padding: 0, overflow: 'hidden' }} onPress={() => router.push(`/fitness/${w.id}`)}>
                {/* Thumbnail / video banner */}
                <View
                  style={{
                    height: 150,
                    backgroundColor: theme.surfaceAlt,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppText variant="display" style={{ fontSize: 44 }}>
                    ▶︎
                  </AppText>
                  <View
                    style={{
                      position: 'absolute',
                      top: spacing.sm,
                      right: spacing.sm,
                      backgroundColor: theme.bg,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 2,
                      borderRadius: radius.pill,
                    }}
                  >
                    <AppText variant="caption">
                      {w.durationMin} {t('fitness.min')}
                    </AppText>
                  </View>
                  {w.premium && (
                    <View
                      style={{
                        position: 'absolute',
                        top: spacing.sm,
                        left: spacing.sm,
                        backgroundColor: theme.warning,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 2,
                        borderRadius: radius.pill,
                      }}
                    >
                      <AppText variant="caption" color={theme.bg} style={{ fontWeight: '700' }}>
                        {t('fitness.premium')}
                      </AppText>
                    </View>
                  )}
                </View>
                <View style={{ padding: spacing.lg }}>
                  <AppText variant="h3">{w.title}</AppText>
                  <Row style={{ marginTop: spacing.xs }}>
                    <AppText variant="caption" color={theme.primary}>
                      {t(`fitness.categories.${w.category}`)}
                    </AppText>
                    <AppText variant="caption" color={theme.textMuted}>
                      · {t(`fitness.levels.${w.level}`)}
                    </AppText>
                  </Row>
                </View>
              </Card>
            ))}
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}
