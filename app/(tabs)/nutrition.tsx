import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Row, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme';

/**
 * AI-nutrition module — intentionally a "coming soon" surface. The photo → AI
 * calorie flow is not wired to any model yet; tapping "scan" reveals an
 * in-development state (with an optional notify-me) rather than calling an API.
 * The screen still communicates the planned value so it reads as a real feature
 * in progress. When the model is ready, replace the dev panel with the capture
 * flow (see docs/ARCHITECTURE.md → "Модуль 3: AI-питание").
 */
export default function NutritionTab() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);
  const [notified, setNotified] = useState(false);

  const features = [
    { icon: '🔥', label: t('nutrition.featureCalories') },
    { icon: '🍛', label: t('nutrition.featureUzbek') },
    { icon: '✏️', label: t('nutrition.featureManual') },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="h1">{t('nutrition.title')}</AppText>
          <View
            style={{
              backgroundColor: theme.warning,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              borderRadius: radius.pill,
            }}
          >
            <AppText variant="caption" color={theme.bg} style={{ fontWeight: '700' }}>
              {t('nutrition.comingSoon')}
            </AppText>
          </View>
        </Row>

        {/* Hero */}
        <Card style={{ backgroundColor: theme.accent, alignItems: 'center' }}>
          <AppText variant="display" style={{ fontSize: 56 }}>
            📷
          </AppText>
          <AppText variant="h2" color="#fff" style={{ textAlign: 'center', marginTop: spacing.sm }}>
            {t('nutrition.heroTitle')}
          </AppText>
          <AppText color="#fff" style={{ opacity: 0.9, textAlign: 'center', marginTop: spacing.sm }}>
            {t('nutrition.heroSubtitle')}
          </AppText>
        </Card>

        {/* What it will do */}
        <Card>
          {features.map((f, i) => (
            <Row key={f.label} style={{ marginTop: i === 0 ? 0 : spacing.md }}>
              <AppText variant="h3">{f.icon}</AppText>
              <AppText style={{ flex: 1 }}>{f.label}</AppText>
            </Row>
          ))}
        </Card>

        {/* Scan CTA → reveals the in-development panel (no AI is run) */}
        {!revealed ? (
          <Button title={`📷 ${t('nutrition.scan')}`} onPress={() => setRevealed(true)} />
        ) : (
          <Card style={{ alignItems: 'center', borderColor: theme.warning }}>
            <AppText variant="display" style={{ fontSize: 44 }}>
              🚧
            </AppText>
            <AppText variant="h3" color={theme.warning} style={{ marginTop: spacing.sm }}>
              {t('nutrition.inDevelopment')}
            </AppText>
            <AppText color={theme.textMuted} style={{ textAlign: 'center', marginTop: spacing.sm }}>
              {t('nutrition.devMessage')}
            </AppText>

            {notified ? (
              <AppText color={theme.success} style={{ marginTop: spacing.lg, textAlign: 'center' }}>
                ✓ {t('nutrition.notifySaved')}
              </AppText>
            ) : (
              <Button
                title={t('nutrition.notifyMe')}
                variant="secondary"
                style={{ marginTop: spacing.lg }}
                onPress={() => setNotified(true)}
              />
            )}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}
