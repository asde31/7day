import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme';
import { techniqueById } from '@/features/breathing/logic';
import { useBreathingStore } from '@/store/breathingStore';
import type { BreathPhase } from '@/types';

const CIRCLE_MIN = 0.55;
const CIRCLE_MAX = 1;

export default function BreathingPlayer() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { id, cravingId } = useLocalSearchParams<{ id: string; cravingId?: string }>();

  const technique = useMemo(() => techniqueById(id ?? 'box'), [id]);
  const incrementSessions = useBreathingStore((s) => s.incrementSessions);
  const resolveCraving = useBreathingStore((s) => s.resolveCraving);

  const scale = useRef(new Animated.Value(CIRCLE_MIN)).current;
  const [stepIndex, setStepIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [finished, setFinished] = useState(false);

  const pattern = technique?.pattern ?? [];
  const totalCycles = technique?.defaultCycles ?? 5;
  const step = pattern[stepIndex];

  // Drive the phase machine.
  useEffect(() => {
    if (!technique || finished || !step) return;
    setRemaining(step.seconds);

    const target =
      step.phase === 'inhale'
        ? CIRCLE_MAX
        : step.phase === 'exhale'
          ? CIRCLE_MIN
          : (scale as unknown as { _value: number })._value ?? CIRCLE_MIN;

    Animated.timing(scale, {
      toValue: target,
      duration: step.seconds * 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    const countdown = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    const advance = setTimeout(() => {
      const nextStep = stepIndex + 1;
      if (nextStep < pattern.length) {
        setStepIndex(nextStep);
      } else {
        const nextCycle = cycle + 1;
        if (nextCycle >= totalCycles) {
          finish();
        } else {
          setCycle(nextCycle);
          setStepIndex(0);
        }
      }
    }, step.seconds * 1000);

    return () => {
      clearInterval(countdown);
      clearTimeout(advance);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, cycle, finished]);

  function finish() {
    setFinished(true);
    incrementSessions();
    if (cravingId) resolveCraving(cravingId);
  }

  if (!technique) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <AppText>—</AppText>
        </View>
      </Screen>
    );
  }

  const phaseLabel = step ? t(`breathing.phases.${step.phase as BreathPhase}`) : '';

  return (
    <Screen>
      <View style={{ flex: 1, padding: spacing.lg, justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()} style={{ alignSelf: 'flex-end' }}>
          <AppText color={theme.textMuted}>{t('common.done')}</AppText>
        </Pressable>

        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <AppText variant="h2">{t(`breathing.techniques.${technique.key}.name`)}</AppText>
          <AppText color={theme.textMuted}>
            {t('breathing.cycles')}: {Math.min(cycle + 1, totalCycles)} / {totalCycles}
          </AppText>
        </View>

        {/* Animated breathing circle */}
        <View style={{ alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Animated.View
            style={{
              width: 260,
              height: 260,
              borderRadius: 130,
              backgroundColor: theme.breath,
              opacity: 0.25,
              position: 'absolute',
              transform: [{ scale }],
            }}
          />
          <Animated.View
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: theme.breath,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale }],
            }}
          >
            {!finished ? (
              <>
                <AppText variant="h1" color="#fff">
                  {phaseLabel}
                </AppText>
                <AppText variant="display" color="#fff" style={{ fontSize: 40 }}>
                  {remaining}
                </AppText>
              </>
            ) : (
              <AppText variant="h2" color="#fff">
                ✓
              </AppText>
            )}
          </Animated.View>
        </View>

        <View style={{ gap: spacing.md }}>
          {finished ? (
            <>
              <AppText variant="h3" color={theme.success} style={{ textAlign: 'center' }}>
                {cravingId ? t('breathing.sos.beaten') : '✓'}
              </AppText>
              <Button title={t('common.done')} onPress={() => router.back()} />
            </>
          ) : (
            <Button title={t('common.stop')} variant="ghost" onPress={() => router.back()} />
          )}
        </View>
      </View>
    </Screen>
  );
}
