import { createContext, useContext, useState, ReactNode } from 'react';
import { Language, Translations, translations } from '../i18n/translations';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function loadLang(): Language {
  try {
    const stored = localStorage.getItem('aurevia_lang');
    if (stored === 'fr' || stored === 'en') return stored;
  } catch {}
  return 'fr';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(loadLang);

  const setLang = (l: Language) => {
    setLangState(l);
    try { localStorage.setItem('aurevia_lang', l); } catch {}
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
