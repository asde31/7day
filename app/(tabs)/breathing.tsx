import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Row, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme';
import { TECHNIQUES, quitStats, sessionSeconds } from '@/features/breathing/logic';
import { useBreathingStore } from '@/store/breathingStore';

export default function BreathingTab() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const quit = useBreathingStore((s) => s.quit);
  const cravings = useBreathingStore((s) => s.cravings);
  const stats = useMemo(() => quitStats(quit, cravings), [quit, cravings]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <AppText variant="h1">{t('breathing.title')}</AppText>

        {/* SOS */}
        <Card style={{ backgroundColor: theme.danger }} onPress={() => router.push('/breathing/sos')}>
          <AppText variant="h2" color="#fff">
            🆘 {t('breathing.sos.title')}
          </AppText>
          <AppText color="#fff" style={{ opacity: 0.9, marginTop: spacing.xs }}>
            {t('breathing.sos.subtitle')}
          </AppText>
        </Card>

        {/* Quit stats */}
        <Card>
          <AppText variant="h3">{t('breathing.stats.title')}</AppText>
          <Row style={{ marginTop: spacing.md, gap: spacing.lg, flexWrap: 'wrap' }}>
            <Stat label={t('breathing.stats.smokeFree')} value={`${stats.smokeFreeDays} ${t('breathing.stats.days')}`} theme={theme} />
            <Stat label={t('breathing.stats.cravingsBeaten')} value={String(stats.cravingsBeaten)} theme={theme} />
            <Stat
              label={t('breathing.stats.moneySaved')}
              value={`${stats.moneySavedUzs.toLocaleString('ru-RU')} сум`}
              theme={theme}
            />
            <Stat label={t('breathing.stats.cigarettesAvoided')} value={String(stats.cigarettesAvoided)} theme={theme} />
          </Row>
          {!quit.quitDate && (
            <Button
              title={t('breathing.stats.setQuitDate')}
              variant="secondary"
              style={{ marginTop: spacing.md }}
              onPress={() =>
                useBreathingStore.getState().setQuitProfile({ quitDate: new Date().toISOString() })
              }
            />
          )}
        </Card>

        {/* Techniques */}
        <AppText variant="h3">{t('breathing.title')}</AppText>
        {TECHNIQUES.map((tech) => (
          <Card key={tech.id} onPress={() => router.push(`/breathing/${tech.id}`)}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Row>
                  <AppText variant="h3">{t(`breathing.techniques.${tech.key}.name`)}</AppText>
                  {tech.premium && (
                    <AppText variant="caption" color={theme.warning}>
                      · {t('common.premium')}
                    </AppText>
                  )}
                </Row>
                <AppText color={theme.textMuted} style={{ marginTop: spacing.xs }}>
                  {t(`breathing.techniques.${tech.key}.desc`)}
                </AppText>
                <AppText variant="caption" color={theme.breath} style={{ marginTop: spacing.xs }}>
                  {tech.pattern.map((p) => p.seconds).join('-')} ·{' '}
                  {Math.round(sessionSeconds(tech, tech.defaultCycles) / 60)} мин
                </AppText>
              </View>
              <AppText variant="h2">🌬️</AppText>
            </Row>
          </Card>
        ))}

        {/* Disclaimer — required by spec */}
        <Card style={{ backgroundColor: theme.surfaceAlt }}>
          <AppText variant="caption" color={theme.textMuted}>
            ⚠️ {t('breathing.disclaimer')}
          </AppText>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value, theme }: { label: string; value: string; theme: { textMuted: string } }) {
  return (
    <View style={{ minWidth: '40%' }}>
      <AppText variant="h2">{value}</AppText>
      <AppText variant="caption" color={theme.textMuted}>
        {label}
      </AppText>
    </View>
  );
}
