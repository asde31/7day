import { useMemo } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Card, Row, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme';
import { useFitnessStore } from '@/store/fitnessStore';

export default function WorkoutPlayer() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = useFitnessStore((s) => s.workouts.find((w) => w.id === id));

  const videoHeight = useMemo(() => (width * 9) / 16, [width]);

  if (!workout) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <AppText>—</AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={{ backgroundColor: '#000' }}>
      <Pressable
        onPress={() => router.back()}
        style={{ position: 'absolute', top: spacing.xl, left: spacing.lg, zIndex: 10 }}
      >
        <AppText color="#fff" variant="h3">
          ✕
        </AppText>
      </Pressable>

      <ScrollView>
        <Video
          source={{ uri: workout.videoUrl }}
          style={{ width, height: videoHeight, backgroundColor: '#000' }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
        />

        <View style={{ padding: spacing.lg, gap: spacing.md, backgroundColor: theme.bg, flex: 1 }}>
          <AppText variant="h1">{workout.title}</AppText>
          <Row style={{ gap: spacing.sm }}>
            <Tag text={t(`fitness.categories.${workout.category}`)} theme={theme} />
            <Tag text={t(`fitness.levels.${workout.level}`)} theme={theme} />
            <Tag text={`${workout.durationMin} ${t('fitness.min')}`} theme={theme} />
          </Row>
          <Card>
            <AppText color={theme.textMuted}>{workout.description}</AppText>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Tag({ text, theme }: { text: string; theme: { surfaceAlt: string; text: string } }) {
  return (
    <View
      style={{
        backgroundColor: theme.surfaceAlt,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 999,
      }}
    >
      <AppText variant="caption">{text}</AppText>
    </View>
  );
}
