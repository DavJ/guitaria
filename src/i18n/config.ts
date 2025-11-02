import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import csTranslation from '../locales/cs/translation.json';
import enTranslation from '../locales/en/translation.json';

const resources = {
  cs: {
    translation: csTranslation,
  },
  en: {
    translation: enTranslation,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'cs', // Default language (Czech)
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
