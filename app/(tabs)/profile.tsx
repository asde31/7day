import { ScrollView, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Card, Chip, Row, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme';
import { SUPPORTED_LANGUAGES, type Language } from '@/lib/i18n';
import { useFitnessStore } from '@/store/fitnessStore';

const LANG_LABELS: Record<Language, string> = {
  ru: 'Русский',
  uz: "O'zbekcha",
  en: 'English',
};

export default function ProfileTab() {
  const theme = useTheme();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isAdmin = useFitnessStore((s) => s.isAdmin);
  const setAdmin = useFitnessStore((s) => s.setAdmin);

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

        {/* Admin (local testing toggle) */}
        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <AppText>{t('fitness.admin.adminMode')}</AppText>
              <AppText variant="caption" color={theme.textMuted} style={{ marginTop: spacing.xs }}>
                {t('fitness.admin.adminModeHint')}
              </AppText>
            </View>
            <Switch
              value={isAdmin}
              onValueChange={setAdmin}
              trackColor={{ true: theme.primary, false: theme.surfaceAlt }}
            />
          </Row>
          {isAdmin && (
            <Button
              title={t('fitness.admin.title')}
              variant="secondary"
              style={{ marginTop: spacing.md }}
              onPress={() => router.push('/fitness/admin')}
            />
          )}
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
