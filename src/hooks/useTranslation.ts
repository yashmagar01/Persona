import { useState, useEffect } from 'react';
import { Language, getTranslation, getCurrentLanguage, setLanguage as setLang } from '@/lib/i18n';

/**
 * Hook to use translations in components
 * Automatically re-renders when language changes
 */
export function useTranslation() {
  const [language, setLanguageState] = useState<Language>(getCurrentLanguage());

  useEffect(() => {
    // Listen for language change events
    const handleLanguageChange = (event: CustomEvent<{ language: Language }>) => {
      setLanguageState(event.detail.language);
    };

    window.addEventListener('languagechange', handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener('languagechange', handleLanguageChange as EventListener);
    };
  }, []);

  const t = (key: string) => getTranslation(key, language);

  const setLanguage = (lang: Language) => {
    setLang(lang);
    setLanguageState(lang);
  };

  return { t, language, setLanguage };
}
