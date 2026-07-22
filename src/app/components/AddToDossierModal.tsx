import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, FolderPlus, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

type EligibleStatus = 'active' | 'in_progress';

interface DossierOption {
  id: string;
  address: string;
  city: string;
  status: EligibleStatus;
  expertCount: number;
}

// Only ACTIF and EN COURS dossiers are eligible targets
const ELIGIBLE_DOSSIERS: DossierOption[] = [
  { id: '1', address: '700, rue des Éclaircies',  city: 'Montréal, QC', status: 'active',      expertCount: 4 },
  { id: '2', address: '1240, boul. des Écluses',  city: 'Laval, QC',    status: 'in_progress', expertCount: 2 },
];

const STATUS_META: Record<EligibleStatus, { color: string; labelFr: string; labelEn: string }> = {
  active:      { color: '#34D399', labelFr: 'ACTIF',    labelEn: 'ACTIVE'      },
  in_progress: { color: '#D4AF37', labelFr: 'EN COURS', labelEn: 'IN PROGRESS' },
};

export interface AddToDossierModalProps {
  providerName: string;
  onClose: () => void;
}

export function AddToDossierModal({ providerName, onClose }: AddToDossierModalProps) {
  const { lang } = useLanguage();
  const [query, setQuery]               = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected]         = useState<DossierOption | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  const s = lang === 'fr' ? {
    title:       "Ajouter l'expert à un dossier",
    subtitle:    'Sélectionnez le dossier de propriété dans lequel vous souhaitez intégrer cet expert.',
    fieldLabel:  'Dossier de propriété',
    placeholder: 'Rechercher un dossier...',
    confirm:     "Confirmer l'ajout",
    cancel:      'Annuler',
    noResults:   'Aucun dossier actif trouvé',
    success:     (addr: string) => `Expert ajouté au dossier — ${addr}`,
    experts:     (n: number) => `${n} expert${n > 1 ? 's' : ''}`,
  } : {
    title:       'Add expert to a file',
    subtitle:    'Select the property file you want to add this expert to.',
    fieldLabel:  'Property file',
    placeholder: 'Search a file...',
    confirm:     'Confirm addition',
    cancel:      'Cancel',
    noResults:   'No active files found',
    success:     (addr: string) => `Expert added to file — ${addr}`,
    experts:     (n: number) => `${n} expert${n > 1 ? 's' : ''}`,
  };

  const filtered = query.trim()
    ? ELIGIBLE_DOSSIERS.filter(d =>
        d.address.toLowerCase().includes(query.toLowerCase()) ||
        d.city.toLowerCase().includes(query.toLowerCase())
      )
    : ELIGIBLE_DOSSIERS;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (d: DossierOption) => {
    setSelected(d);
    setQuery(d.address);
    setDropdownOpen(false);
  };

  const handleQueryChange = (v: string) => {
    setQuery(v);
    setSelected(null);
    setDropdownOpen(true);
  };

  const handleConfirm = () => {
    if (!selected) {
      setDropdownOpen(true);
      inputRef.current?.focus();
      return;
    }
    toast.success(s.success(selected.address));
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 flex items-center justify-center z-[1200] px-5"
      style={{ background: 'rgba(3,8,18,0.78)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 18 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-3xl p-8"
        style={{
          background: 'rgba(8,16,32,0.99)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 48px 96px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Close ── */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 transition-colors"
          style={{ color: 'rgba(255,255,255,0.25)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
        >
          <X className="size-4" />
        </button>

        {/* ── Icon ── */}
        <div className="flex justify-center mb-6">
          <div
            className="size-[68px] rounded-2xl flex items-center justify-center relative"
            style={{ background: 'rgba(212,175,55,0.09)', border: '1px solid rgba(212,175,55,0.22)' }}
          >
            <FolderPlus className="size-[30px]" style={{ color: '#D4AF37' }} />
            {/* Gold glow */}
            <div className="absolute inset-0 rounded-2xl"
              style={{ boxShadow: '0 0 32px rgba(212,175,55,0.12)' }} />
          </div>
        </div>

        {/* ── Heading ── */}
        <h2
          className="text-white text-xl font-light text-center leading-snug mb-2"
          style={{ letterSpacing: '-0.01em' }}
        >
          {s.title}
        </h2>
        <p className="text-sm text-center leading-relaxed mb-7"
          style={{ color: 'rgba(255,255,255,0.35)' }}>
          {s.subtitle}
        </p>

        {/* ── Expert chip ── */}
        <div className="flex justify-center mb-6">
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full"
            style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.18)' }}
          >
            <div className="size-1.5 rounded-full" style={{ background: '#D4AF37' }} />
            <span className="text-[12px] font-medium truncate max-w-[260px]"
              style={{ color: 'rgba(212,175,55,0.8)' }}>
              {providerName}
            </span>
          </div>
        </div>

        {/* ── Hybrid search / dropdown ── */}
        <div className="mb-7" ref={wrapperRef}>
          <label
            className="block text-[10px] font-bold tracking-widest uppercase mb-2"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {s.fieldLabel}
          </label>

          <div className="relative">
            {/* Input row */}
            <div
              className="flex items-center rounded-xl transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${dropdownOpen || selected ? 'rgba(212,175,55,0.38)' : 'rgba(255,255,255,0.1)'}`,
                boxShadow: dropdownOpen || selected ? '0 0 0 3px rgba(212,175,55,0.07)' : 'none',
              }}
            >
              <Search className="size-4 ml-4 shrink-0" style={{ color: 'rgba(255,255,255,0.28)' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                onFocus={() => setDropdownOpen(true)}
                placeholder={s.placeholder}
                className="flex-1 px-3 py-3.5 bg-transparent text-white text-sm outline-none"
                style={{ caretColor: '#D4AF37' }}
              />
              {/* Placeholder color via tailwind won't work inline, use a trick */}
              <button
                type="button"
                onClick={() => { setDropdownOpen(v => !v); setTimeout(() => inputRef.current?.focus(), 0); }}
                className="px-3.5 py-3.5 transition-colors shrink-0"
                style={{ color: dropdownOpen ? '#D4AF37' : 'rgba(255,255,255,0.3)' }}
              >
                <ChevronDown className={`size-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dropdown list */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-10"
                  style={{
                    background: 'rgba(10,20,40,0.99)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 48px rgba(0,0,0,0.55)',
                  }}
                >
                  {filtered.length === 0 ? (
                    <div className="px-5 py-5 text-center text-sm"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {s.noResults}
                    </div>
                  ) : (
                    filtered.map((d, i) => {
                      const meta  = STATUS_META[d.status];
                      const label = lang === 'fr' ? meta.labelFr : meta.labelEn;
                      const isSelected = selected?.id === d.id;

                      return (
                        <motion.button
                          key={d.id}
                          type="button"
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => handleSelect(d)}
                          className="w-full flex items-center gap-3.5 px-4 py-4 text-left transition-all"
                          style={{
                            background: isSelected ? 'rgba(212,175,55,0.07)' : 'transparent',
                            borderBottom: i < filtered.length - 1
                              ? '1px solid rgba(255,255,255,0.05)'
                              : 'none',
                          }}
                          onMouseEnter={e => {
                            if (!isSelected)
                              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                          }}
                          onMouseLeave={e => {
                            if (!isSelected)
                              (e.currentTarget as HTMLElement).style.background = 'transparent';
                          }}
                        >
                          {/* Status dot */}
                          <div
                            className="size-2.5 rounded-full shrink-0"
                            style={{ background: meta.color, boxShadow: `0 0 7px ${meta.color}60` }}
                          />

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate leading-tight">
                              {d.address}
                            </p>
                            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              {d.city} · {s.experts(d.expertCount)}
                            </p>
                          </div>

                          {/* Status badge */}
                          <span
                            className="shrink-0 text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full"
                            style={{
                              background: `${meta.color}14`,
                              color: meta.color,
                              border: `1px solid ${meta.color}30`,
                            }}
                          >
                            {label}
                          </span>

                          {/* Selected check */}
                          {isSelected && (
                            <Check className="size-4 shrink-0" style={{ color: '#D4AF37' }} />
                          )}
                        </motion.button>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── CTA buttons ── */}
        <div className="flex flex-col gap-2.5">
          <motion.button
            onClick={handleConfirm}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all flex items-center justify-center gap-2"
            style={{
              background: selected
                ? 'linear-gradient(135deg, #D4AF37 0%, #B8962F 100%)'
                : 'rgba(212,175,55,0.12)',
              color:  selected ? '#07111f' : 'rgba(212,175,55,0.45)',
              cursor: selected ? 'pointer' : 'default',
              boxShadow: selected ? '0 4px 20px rgba(212,175,55,0.25)' : 'none',
            }}
          >
            {selected && <Check className="size-4" strokeWidth={3} />}
            {s.confirm}
          </motion.button>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.28)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
          >
            {s.cancel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
