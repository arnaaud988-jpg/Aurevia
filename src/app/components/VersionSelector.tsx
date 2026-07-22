import { useState, useRef, useEffect } from 'react';
import { Settings, Check, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useVersion, AppVersion } from '../contexts/VersionContext';
import { useLanguage } from '../contexts/LanguageContext';

export function VersionSelector() {
  const { version, setVersion, isAlpha } = useVersion();
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const options: { id: AppVersion; icon: React.ReactNode; label: string; sub: string }[] = lang === 'fr'
    ? [
        {
          id: 'stable',
          icon: <Shield className="size-3.5" />,
          label: 'Stable',
          sub:   'Fonctionnalités vérifiées et optimisées',
        },
        {
          id: 'alpha',
          icon: <Zap className="size-3.5" />,
          label: 'Alpha',
          sub:   'Réservation · Calendrier · Disponibilités',
        },
      ]
    : [
        {
          id: 'stable',
          icon: <Shield className="size-3.5" />,
          label: 'Stable',
          sub:   'Verified and optimized features',
        },
        {
          id: 'alpha',
          icon: <Zap className="size-3.5" />,
          label: 'Alpha',
          sub:   'Booking · Calendar · Availability',
        },
      ];

  return (
    <div ref={ref} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">

      {/* Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mb-3 rounded-2xl overflow-hidden"
            style={{
              width: '280px',
              background: 'rgba(8,16,32,0.98)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 56px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {/* Popover header */}
            <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                {lang === 'fr' ? "Version de l'interface" : 'Interface version'}
              </p>
            </div>

            {/* Options */}
            {options.map((opt, i) => {
              const isActive = version === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => { setVersion(opt.id); setOpen(false); }}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-all"
                  style={{
                    background: isActive ? 'rgba(212,175,55,0.06)' : 'transparent',
                    borderBottom: i < options.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {/* Icon bubble */}
                  <div
                    className="size-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: isActive
                        ? opt.id === 'alpha' ? 'rgba(212,175,55,0.15)' : 'rgba(52,211,153,0.12)'
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isActive
                        ? opt.id === 'alpha' ? 'rgba(212,175,55,0.3)' : 'rgba(52,211,153,0.25)'
                        : 'rgba(255,255,255,0.08)'}`,
                      color: isActive
                        ? opt.id === 'alpha' ? '#D4AF37' : '#34D399'
                        : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {opt.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.55)' }}
                      >
                        {opt.label}
                      </span>
                      {opt.id === 'alpha' && (
                        <span
                          className="text-[8px] font-bold tracking-widest px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }}
                        >
                          BÊTA
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] mt-0.5 leading-snug"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {opt.sub}
                    </p>
                  </div>

                  {/* Active check */}
                  {isActive && (
                    <Check
                      className="size-4 shrink-0"
                      style={{ color: opt.id === 'alpha' ? '#D4AF37' : '#34D399' }}
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileTap={{ scale: 0.92 }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full transition-all"
        style={{
          background: open
            ? 'rgba(255,255,255,0.1)'
            : isAlpha
            ? 'rgba(212,175,55,0.1)'
            : 'rgba(255,255,255,0.06)',
          border: `1px solid ${open
            ? 'rgba(255,255,255,0.2)'
            : isAlpha
            ? 'rgba(212,175,55,0.35)'
            : 'rgba(255,255,255,0.12)'}`,
          backdropFilter: 'blur(16px)',
          boxShadow: isAlpha
            ? '0 4px 20px rgba(212,175,55,0.15)'
            : '0 4px 16px rgba(0,0,0,0.3)',
        }}
      >
        <motion.div
          animate={open ? { rotate: 90 } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Settings
            className="size-3.5"
            style={{ color: isAlpha ? '#D4AF37' : 'rgba(255,255,255,0.5)' }}
          />
        </motion.div>
        <span
          className="text-[11px] font-bold tracking-widest"
          style={{ color: isAlpha ? '#D4AF37' : 'rgba(255,255,255,0.4)' }}
        >
          {isAlpha ? 'α ALPHA' : 'STABLE'}
        </span>
      </motion.button>
    </div>
  );
}
