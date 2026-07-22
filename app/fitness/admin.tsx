import { useState } from 'react';
import { Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Chip, Row, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme';
import { useFitnessStore } from '@/store/fitnessStore';
import { CATEGORIES, GENDERS, LEVELS, isValidVideoUrl } from '@/features/fitness/logic';
import type { WorkoutCategory, WorkoutGender, WorkoutLevel } from '@/types';

export default function FitnessAdmin() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const isAdmin = useFitnessStore((s) => s.isAdmin);
  const workouts = useFitnessStore((s) => s.workouts);
  const addWorkout = useFitnessStore((s) => s.addWorkout);
  const removeWorkout = useFitnessStore((s) => s.removeWorkout);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [durationMin, setDurationMin] = useState(15);
  const [level, setLevel] = useState<WorkoutLevel>('beginner');
  const [category, setCategory] = useState<WorkoutCategory>('hiit');
  const [gender, setGender] = useState<WorkoutGender>('all');
  const [premium, setPremium] = useState(true);
  const [urlError, setUrlError] = useState(false);

  if (!isAdmin) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.lg }}>
          <AppText variant="h3" style={{ textAlign: 'center' }}>
            🔒 {t('fitness.admin.onlyAdmin')}
          </AppText>
          <Button title={t('common.done')} onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  function save() {
    if (!isValidVideoUrl(videoUrl)) {
      setUrlError(true);
      return;
    }
    addWorkout({
      title: title.trim() || '—',
      description: description.trim(),
      videoUrl: videoUrl.trim(),
      durationMin,
      level,
      category,
      gender,
      premium,
    });
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setUrlError(false);
  }

  const inputStyle = {
    color: theme.text,
    fontSize: 16,
    backgroundColor: theme.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="h2">{t('fitness.admin.title')}</AppText>
          <Pressable onPress={() => router.back()}>
            <AppText color={theme.textMuted}>{t('common.done')}</AppText>
          </Pressable>
        </Row>

        <Card>
          <AppText variant="label" color={theme.textMuted}>
            {t('fitness.admin.titleField')}
          </AppText>
          <TextInput value={title} onChangeText={setTitle} style={inputStyle} placeholderTextColor={theme.textMuted} />

          <AppText variant="label" color={theme.textMuted} style={{ marginTop: spacing.md }}>
            {t('fitness.admin.videoUrl')}
          </AppText>
          <TextInput
            value={videoUrl}
            onChangeText={setVideoUrl}
            autoCapitalize="none"
            keyboardType="url"
            placeholder="https://..."
            placeholderTextColor={theme.textMuted}
            style={inputStyle}
          />
          <AppText variant="caption" color={urlError ? theme.danger : theme.textMuted} style={{ marginTop: spacing.xs }}>
            {urlError ? t('fitness.admin.invalidUrl') : t('fitness.admin.videoUrlHint')}
          </AppText>

          <AppText variant="label" color={theme.textMuted} style={{ marginTop: spacing.md }}>
            {t('fitness.admin.description')}
          </AppText>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            style={[inputStyle, { minHeight: 64 }]}
            placeholderTextColor={theme.textMuted}
          />

          <Row style={{ justifyContent: 'space-between', marginTop: spacing.md }}>
            <AppText>{t('fitness.admin.duration')}</AppText>
            <Row>
              <Button title="−5" variant="secondary" onPress={() => setDurationMin(Math.max(5, durationMin - 5))} />
              <AppText variant="h3" style={{ width: 48, textAlign: 'center' }}>
                {durationMin}
              </AppText>
              <Button title="+5" variant="secondary" onPress={() => setDurationMin(durationMin + 5)} />
            </Row>
          </Row>
        </Card>

        <Card>
          <AppText variant="label" color={theme.textMuted}>
            {t('fitness.admin.category')}
          </AppText>
          <Row style={{ marginTop: spacing.sm, flexWrap: 'wrap', gap: spacing.sm }}>
            {CATEGORIES.map((c) => (
              <Chip key={c} label={t(`fitness.categories.${c}`)} active={category === c} onPress={() => setCategory(c)} />
            ))}
          </Row>

          <AppText variant="label" color={theme.textMuted} style={{ marginTop: spacing.md }}>
            {t('fitness.admin.level')}
          </AppText>
          <Row style={{ marginTop: spacing.sm, gap: spacing.sm }}>
            {LEVELS.map((l) => (
              <Chip key={l} label={t(`fitness.levels.${l}`)} active={level === l} onPress={() => setLevel(l)} />
            ))}
          </Row>

          <AppText variant="label" color={theme.textMuted} style={{ marginTop: spacing.md }}>
            {t('fitness.admin.gender')}
          </AppText>
          <Row style={{ marginTop: spacing.sm, gap: spacing.sm }}>
            {GENDERS.map((g) => (
              <Chip key={g} label={t(`fitness.genders.${g}`)} active={gender === g} onPress={() => setGender(g)} />
            ))}
          </Row>

          <Row style={{ justifyContent: 'space-between', marginTop: spacing.md }}>
            <AppText style={{ flex: 1 }}>{t('fitness.admin.premium')}</AppText>
            <Switch value={premium} onValueChange={setPremium} trackColor={{ true: theme.primary, false: theme.surfaceAlt }} />
          </Row>
        </Card>

        <Button title={t('fitness.admin.save')} onPress={save} />

        {/* Existing videos */}
        <AppText variant="label" color={theme.textMuted}>
          {t('fitness.admin.existing')} ({workouts.length})
        </AppText>
        {workouts.map((w) => (
          <Card key={w.id}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <AppText>{w.title}</AppText>
                <AppText variant="caption" color={theme.textMuted} numberOfLines={1}>
                  {t(`fitness.categories.${w.category}`)} · {w.durationMin} {t('fitness.min')}
                </AppText>
              </View>
              <Button title="✕" variant="ghost" onPress={() => removeWorkout(w.id)} />
            </Row>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
