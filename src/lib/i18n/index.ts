import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import ru from './locales/ru';
import uz from './locales/uz';
import en from './locales/en';

export const SUPPORTED_LANGUAGES = ['ru', 'uz', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Language priority reflects the target market (Tashkent tier-1): Russian is
 * the default UI language, with Uzbek and English available. Device locale is
 * honoured when it matches a supported language.
 */
function detectLanguage(): Language {
  const device = getLocales()[0]?.languageCode ?? 'ru';
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(device)
    ? (device as Language)
    : 'ru';
}

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    uz: { translation: uz },
    en: { translation: en },
  },
  lng: detectLanguage(),
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
