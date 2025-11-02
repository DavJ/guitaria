import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import csTranslation from '../locales/cs/translation.json';
import enTranslation from '../locales/en/translation.json';
import skTranslation from '../locales/sk/translation.json';
import esTranslation from '../locales/es/translation.json';
import deTranslation from '../locales/de/translation.json';
import frTranslation from '../locales/fr/translation.json';
import ruTranslation from '../locales/ru/translation.json';
import zhTranslation from '../locales/zh/translation.json';
import arTranslation from '../locales/ar/translation.json';
import hiTranslation from '../locales/hi/translation.json';
import jaTranslation from '../locales/ja/translation.json';
import itTranslation from '../locales/it/translation.json';

const resources = {
  cs: {
    translation: csTranslation,
  },
  en: {
    translation: enTranslation,
  },
  sk: {
    translation: skTranslation,
  },
  es: {
    translation: esTranslation,
  },
  de: {
    translation: deTranslation,
  },
  fr: {
    translation: frTranslation,
  },
  ru: {
    translation: ruTranslation,
  },
  zh: {
    translation: zhTranslation,
  },
  ar: {
    translation: arTranslation,
  },
  hi: {
    translation: hiTranslation,
  },
  ja: {
    translation: jaTranslation,
  },
  it: {
    translation: itTranslation,
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
