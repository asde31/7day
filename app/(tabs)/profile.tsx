import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Chip, Row, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme';
import { SUPPORTED_LANGUAGES, type Language } from '@/lib/i18n';

const LANG_LABELS: Record<Language, string> = {
  ru: 'Русский',
  uz: "O'zbekcha",
  en: 'English',
};

export default function ProfileTab() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <AppText variant="h1">{t('profile.title')}</AppText>

        {/* Subscription */}
        <Card style={{ backgroundColor: theme.accent }}>
          <AppText variant="h3" color="#fff">
            ⭐ {t('profile.subscription')}
          </AppText>
          <AppText color="#fff" style={{ opacity: 0.9, marginTop: spacing.xs }}>
            {t('profile.freePlan')}
          </AppText>
          <Button
            title={t('profile.upgrade')}
            variant="secondary"
            style={{ marginTop: spacing.md }}
            onPress={() => {}}
          />
        </Card>

        {/* Language */}
        <Card>
          <AppText variant="label" color={theme.textMuted}>
            {t('profile.language')}
          </AppText>
          <Row style={{ marginTop: spacing.md, gap: spacing.sm }}>
            {SUPPORTED_LANGUAGES.map((lng) => (
              <Chip
                key={lng}
                label={LANG_LABELS[lng]}
                active={i18n.language === lng}
                onPress={() => i18n.changeLanguage(lng)}
              />
            ))}
          </Row>
        </Card>

        {/* About */}
        <Card>
          <AppText variant="label" color={theme.textMuted}>
            {t('profile.about')}
          </AppText>
          <View style={{ marginTop: spacing.sm }}>
            <AppText>7day · v0.1.0</AppText>
            <AppText color={theme.textMuted} variant="caption" style={{ marginTop: spacing.xs }}>
              Утренняя дисциплина: будильник, вода, дыхание. Фаза 1 (MVP).
            </AppText>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}
