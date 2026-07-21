import { useEffect, useMemo, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, ProgressBar } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme';
import {
  affirmationMatches,
  generateMathSet,
  type MathProblem,
} from '@/features/missions/logic';
import type { MissionConfig } from '@/types';

/**
 * Renders the active dismiss mission and calls `onComplete` exactly once when
 * the user clears it. Each mission is self-contained so the ring screen only
 * has to gate snooze on the completion flag.
 */
export function MissionRunner({
  mission,
  onComplete,
}: {
  mission: MissionConfig;
  onComplete: () => void;
}) {
  switch (mission.type) {
    case 'math':
      return <MathMission mission={mission} onComplete={onComplete} />;
    case 'steps':
      return <StepsMission mission={mission} onComplete={onComplete} />;
    case 'affirmation':
      return <AffirmationMission mission={mission} onComplete={onComplete} />;
    case 'photo':
      return <PhotoMission mission={mission} onComplete={onComplete} />;
    default:
      return null;
  }
}

function MathMission({ mission, onComplete }: { mission: MissionConfig; onComplete: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const problems = useMemo<MathProblem[]>(() => generateMathSet(mission.difficulty), [mission.difficulty]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  function submit() {
    if (Number(value) === problems[index].answer) {
      setValue('');
      setError(false);
      if (index + 1 >= problems.length) onComplete();
      else setIndex((i) => i + 1);
    } else {
      setError(true);
    }
  }

  return (
    <Card>
      <AppText variant="label" color={theme.textMuted}>
        {t('alarm.missionScreen.mathPrompt', { index: index + 1, total: problems.length })}
      </AppText>
      <AppText variant="display" style={{ textAlign: 'center', marginVertical: spacing.lg }}>
        {problems[index].prompt}
      </AppText>
      <TextInput
        value={value}
        onChangeText={setValue}
        keyboardType="number-pad"
        autoFocus
        placeholder={t('alarm.missionScreen.yourAnswer')}
        placeholderTextColor={theme.textMuted}
        onSubmitEditing={submit}
        style={{
          color: theme.text,
          fontSize: 28,
          textAlign: 'center',
          backgroundColor: theme.surfaceAlt,
          borderRadius: radius.md,
          padding: spacing.md,
        }}
      />
      {error && (
        <AppText color={theme.danger} style={{ textAlign: 'center', marginTop: spacing.sm }}>
          {t('alarm.missionScreen.wrong')}
        </AppText>
      )}
      <Button title={t('common.continue')} onPress={submit} style={{ marginTop: spacing.lg }} />
    </Card>
  );
}

function StepsMission({ mission, onComplete }: { mission: MissionConfig; onComplete: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const target = mission.stepCount ?? 30;
  const [steps, setSteps] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    let sub: { remove: () => void } | undefined;
    let cancelled = false;
    (async () => {
      const available = await Pedometer.isAvailableAsync().catch(() => false);
      if (!available || cancelled) return;
      const start = 0;
      sub = Pedometer.watchStepCount((result) => {
        setSteps(result.steps - start);
      });
    })();
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, []);

  useEffect(() => {
    if (steps >= target && !done.current) {
      done.current = true;
      onComplete();
    }
  }, [steps, target, onComplete]);

  return (
    <Card>
      <AppText variant="label" color={theme.textMuted} style={{ textAlign: 'center' }}>
        {t('alarm.missionScreen.stepsHint')}
      </AppText>
      <AppText variant="display" style={{ textAlign: 'center', marginVertical: spacing.lg }}>
        {t('alarm.missionScreen.stepsProgress', { done: Math.min(steps, target), total: target })}
      </AppText>
      <ProgressBar value={steps / target} color={theme.primary} />
      {/* Dev fallback when no pedometer (e.g. simulator). */}
      {__DEV__ && (
        <Button
          title="+5 (dev)"
          variant="ghost"
          onPress={() => setSteps((s) => s + 5)}
          style={{ marginTop: spacing.md }}
        />
      )}
    </Card>
  );
}

function AffirmationMission({
  mission,
  onComplete,
}: {
  mission: MissionConfig;
  onComplete: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const phrase = mission.phrase ?? 'Сегодня будет отличный день';
  const [transcript, setTranscript] = useState('');
  const [failed, setFailed] = useState(false);

  // NOTE: on-device speech-to-text is wired via a native module
  // (@react-native-voice/voice) after prebuild — see docs/ARCHITECTURE.md. The
  // verification logic (affirmationMatches) is production-ready; this UI takes
  // the recognised transcript. In the managed scaffold we accept typed input so
  // the flow is testable end-to-end.
  function verify() {
    if (affirmationMatches(transcript, phrase)) onComplete();
    else setFailed(true);
  }

  return (
    <Card>
      <AppText variant="label" color={theme.textMuted}>
        {t('alarm.missionScreen.affirmationSay')}
      </AppText>
      <AppText variant="h2" style={{ marginVertical: spacing.lg, textAlign: 'center' }}>
        “{phrase}”
      </AppText>
      <TextInput
        value={transcript}
        onChangeText={setTranscript}
        placeholder={t('alarm.missionScreen.affirmationListening')}
        placeholderTextColor={theme.textMuted}
        style={{
          color: theme.text,
          fontSize: 18,
          backgroundColor: theme.surfaceAlt,
          borderRadius: radius.md,
          padding: spacing.md,
        }}
      />
      {failed && (
        <AppText color={theme.danger} style={{ marginTop: spacing.sm }}>
          {t('alarm.missionScreen.affirmationTryAgain')}
        </AppText>
      )}
      <Button title={t('common.done')} onPress={verify} style={{ marginTop: spacing.lg }} />
    </Card>
  );
}

function PhotoMission({ mission, onComplete }: { mission: MissionConfig; onComplete: () => void }) {
  const { t } = useTranslation();
  // expo-camera capture is wired at the screen level; here we present the hint
  // and a capture trigger. A production build stores the photo and can run an
  // optional Claude-vision object check (Phase 2) before accepting.
  return (
    <Card>
      <AppText variant="h3" style={{ textAlign: 'center' }}>
        {t('alarm.missionScreen.photoHint', {
          hint: mission.photoHint ?? 'раковина в ванной',
        })}
      </AppText>
      <View style={{ height: spacing.lg }} />
      <Button title={t('alarm.missionScreen.takePhoto')} onPress={onComplete} />
    </Card>
  );
}
