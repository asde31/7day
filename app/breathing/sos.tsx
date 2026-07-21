import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Chip, Row, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme';
import { CRAVING_TRIGGERS } from '@/features/breathing/logic';
import { useBreathingStore } from '@/store/breathingStore';

export default function SosScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const logCraving = useBreathingStore((s) => s.logCraving);

  function startWithTrigger(trigger: (typeof CRAVING_TRIGGERS)[number]) {
    // Log the craving as unresolved; the breathing session marks it resolved
    // on completion, feeding the "cravings beaten" statistic.
    const id = logCraving(trigger, false);
    router.replace({ pathname: '/breathing/box', params: { cravingId: id } });
  }

  return (
    <Screen style={{ backgroundColor: theme.danger }}>
      <View style={{ flex: 1, padding: spacing.lg, justifyContent: 'center', gap: spacing.xl }}>
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <AppText variant="display" color="#fff">
            🆘
          </AppText>
          <AppText variant="h1" color="#fff">
            {t('breathing.sos.title')}
          </AppText>
          <AppText color="#fff" style={{ opacity: 0.9, textAlign: 'center' }}>
            {t('breathing.sos.subtitle')}
          </AppText>
        </View>

        <Card>
          <AppText variant="label" color={theme.textMuted}>
            {t('breathing.triggers.title')}
          </AppText>
          <Row style={{ marginTop: spacing.md, flexWrap: 'wrap', gap: spacing.sm }}>
            {CRAVING_TRIGGERS.map((tr) => (
              <Chip key={tr} label={t(`breathing.triggers.${tr}`)} onPress={() => startWithTrigger(tr)} />
            ))}
          </Row>
        </Card>

        <Button
          title={t('breathing.sos.start')}
          variant="secondary"
          onPress={() => startWithTrigger('other')}
        />
        <Button title={t('common.cancel')} variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
