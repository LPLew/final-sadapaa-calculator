
import { useState, useEffect, useCallback } from 'react';
import { translations } from '../utils/translations';
import { LanguageCode, AppSettings } from '../types';

const LOCAL_STORAGE_SETTINGS_KEY = 'bigNumberProCalculatorSettings';

// A default 'en' language object to ensure fallback works even if 'en' is missing in the main object
const defaultEnglishTranslations = translations.en || {};

export const useTranslations = () => {
  const [language, setLanguage] = useState<LanguageCode>('en');

  const getLanguageFromStorage = useCallback((): LanguageCode => {
    try {
      const storedSettingsRaw = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (storedSettingsRaw) {
        const settings: AppSettings = JSON.parse(storedSettingsRaw);
        // Ensure the language exists in our translations, otherwise default to 'en'
        const lang = settings.selectedSecondaryLanguage;
        return lang && lang in translations ? lang : 'en';
      }
    } catch (e) {
      console.error("Failed to parse settings from localStorage", e);
    }
    return 'en';
  }, []);

  useEffect(() => {
    const currentLang = getLanguageFromStorage();
    setLanguage(currentLang);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_SETTINGS_KEY || event.key === null) { // event.key is null when storage is cleared
        const newLang = getLanguageFromStorage();
        if (newLang !== language) {
           setLanguage(newLang);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [getLanguageFromStorage, language]);

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    const langWithFallback = language in translations ? language : 'en';
    const translationSet = translations[langWithFallback] || defaultEnglishTranslations;
    
    let translatedString: string = (translationSet as any)[key] || defaultEnglishTranslations[key] || key;

    if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
            translatedString = translatedString.replace(regex, String(replacements[placeholder]));
        });
    }

    return translatedString;
  }, [language]);

  return { t, language };
};
