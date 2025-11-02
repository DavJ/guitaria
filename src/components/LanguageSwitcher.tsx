import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useAppStore();

  const handleLanguageChange = (lang: 'cs' | 'en') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleLanguageChange('cs')}
        className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
          language === 'cs'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        CS
      </button>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
          language === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
