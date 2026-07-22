import { useLanguage } from '../contexts/LanguageContext';

interface LanguageToggleProps {
  variant?: 'dark' | 'light';
}

export function LanguageToggle({ variant = 'dark' }: LanguageToggleProps) {
  const { lang, setLang } = useLanguage();

  const activeColor = variant === 'dark' ? 'text-white font-semibold' : 'text-[#0A1628] font-semibold';
  const inactiveColor = variant === 'dark' ? 'text-white/35' : 'text-[#0A1628]/30';
  const separatorColor = variant === 'dark' ? 'bg-white/20' : 'bg-[#0A1628]/15';

  return (
    <div className="flex items-center gap-1.5 text-xs tracking-widest uppercase select-none">
      <button
        onClick={() => setLang('fr')}
        className={`transition-all leading-none ${lang === 'fr' ? activeColor : inactiveColor + ' hover:opacity-70'}`}
      >
        FR
      </button>
      <div className={`w-px h-3 ${separatorColor}`} />
      <button
        onClick={() => setLang('en')}
        className={`transition-all leading-none ${lang === 'en' ? activeColor : inactiveColor + ' hover:opacity-70'}`}
      >
        EN
      </button>
    </div>
  );
}
