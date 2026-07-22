import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, MapPin, Heart, FolderOpen, ArrowRight, Users, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { SearchParams } from '../App';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import logoImage from '../../imports/2f8e629f-4ee0-4e11-8d04-458f66b26676.png';

const HERO_URL =
  'https://images.unsplash.com/photo-1628744876497-eb30460be9f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920';

interface SearchHubProps {
  onSearch:    (params: SearchParams) => void;
  onFavorites: () => void;
  onDossier?:  (dossierId: string) => void;
  onUrgent?:   () => void;
}

const SERVICE_KEYS = [
  'home-staging', 'photo', 'notaire', 'inspection',
  'paysager', 'design', 'evaluation', 'demenagement',
  'pisciniste', 'chocolatier', 'fleuriste', 'nettoyage',
];

type DossierStatus = 'new' | 'active' | 'in_progress' | 'completed';

interface Dossier {
  id: string;
  address: string;
  city: string;
  experts: number;
  status: DossierStatus;
  updatedKey: 'today' | '2d' | '5d' | '1w';
}

const MOCK_DOSSIERS: Dossier[] = [
  { id: '1', address: '700, rue des Éclaircies',     city: 'Montréal, QC',  experts: 4, status: 'active',      updatedKey: '2d'    },
  { id: '2', address: '1240, boul. des Écluses',     city: 'Laval, QC',     experts: 2, status: 'in_progress', updatedKey: '5d'    },
  { id: '3', address: '3815, av. des Pins',          city: 'Montréal, QC',  experts: 6, status: 'completed',   updatedKey: '1w'    },
  { id: '4', address: '550, rue Saint-Laurent',      city: 'Brossard, QC',  experts: 1, status: 'new',         updatedKey: 'today' },
];

const STATUS_META: Record<DossierStatus, { color: string; fr: string; en: string }> = {
  new:         { color: '#60A5FA', fr: 'Nouveau',   en: 'New'         },
  active:      { color: '#34D399', fr: 'Actif',     en: 'Active'      },
  in_progress: { color: '#D4AF37', fr: 'En cours',  en: 'In progress' },
  completed:   { color: '#94A3B8', fr: 'Complété',  en: 'Completed'   },
};

const UPDATED_LABELS: Record<Dossier['updatedKey'], { fr: string; en: string }> = {
  today: { fr: "Aujourd'hui", en: 'Today'        },
  '2d':  { fr: 'Il y a 2 jours', en: '2 days ago'  },
  '5d':  { fr: 'Il y a 5 jours', en: '5 days ago'  },
  '1w':  { fr: 'Il y a 1 semaine', en: '1 week ago' },
};

// Aurevia providers per dossier — mirrors DOSSIERS_DATA in DossierDetail.tsx
const DOSSIER_PROVIDERS: Record<string, Array<{ name: string; category: string }>> = {
  '1': [
    { name: 'Éval. Immobilière Gagnon',     category: 'evaluation'   },
    { name: 'Inspection Bâtiment Pro QC',   category: 'inspection'   },
    { name: 'Lumière & Propriété',          category: 'photo'        },
    { name: 'Staging Prestige Montréal',    category: 'home-staging' },
  ],
  '2': [
    { name: 'Étude Notariale Bergeron',     category: 'notaire'      },
    { name: 'Déménagement Express MTL',     category: 'demenagement' },
  ],
  '3': [
    { name: 'Éval. Immobilière Gagnon',     category: 'evaluation'   },
    { name: 'Inspection Bâtiment Pro QC',   category: 'inspection'   },
    { name: 'Photos HD Prestige',           category: 'photo'        },
    { name: 'Élite Home Staging',           category: 'home-staging' },
    { name: 'Atelier Intérieur Prestige',   category: 'design'       },
    { name: 'Me Sophie Tremblay, Notaire',  category: 'notaire'      },
  ],
  '4': [
    { name: 'Inspecta-Maison',              category: 'inspection'   },
  ],
};

const CATEGORY_EMOJI: Record<string, string> = {
  evaluation:    '📋', inspection: '🔍', photo:      '📷',
  'home-staging':'🏠', notaire:    '⚖️', demenagement:'🚛',
  design:        '🎨', paysager:   '🌿', nettoyage:  '✨',
  evaluation2:   '📋', pisciniste: '🏊', fleuriste:  '🌸',
};

export function SearchHub({ onSearch, onFavorites, onDossier, onUrgent }: SearchHubProps) {
  const { favorites } = useFavorites();
  const { t, lang } = useLanguage();
  const [address, setAddress] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAnimation, setShowAnimation] = useState(() => {
    try { return sessionStorage.getItem('aurevia_intro_shown') !== '1'; } catch { return false; }
  });
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDossiers, setShowDossiers] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dossiersRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const suggestDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nav = lang === 'fr' ? {
    dossiers: 'Mes Dossiers',
    activeCount: (n: number) => `${n} dossier${n > 1 ? 's' : ''} actif${n > 1 ? 's' : ''}`,
    experts: (n: number) => `${n} expert${n > 1 ? 's' : ''} engagé${n > 1 ? 's' : ''}`,
    access: 'Accéder',
    newDossier: '+ Créer un dossier',
    updatedAt: 'Mis à jour',
  } : {
    dossiers: 'My Files',
    activeCount: (n: number) => `${n} active file${n > 1 ? 's' : ''}`,
    experts: (n: number) => `${n} expert${n > 1 ? 's' : ''} engaged`,
    access: 'Open',
    newDossier: '+ Create a file',
    updatedAt: 'Updated',
  };

  const activeDossiers = MOCK_DOSSIERS.filter(d => d.status !== 'completed');

  useEffect(() => {
    if (!showAnimation) return;
    const timer = setTimeout(() => {
      setShowAnimation(false);
      try { sessionStorage.setItem('aurevia_intro_shown', '1'); } catch { /* sandboxed */ }
    }, 6000);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (dossiersRef.current && !dossiersRef.current.contains(e.target as Node)) {
        setShowDossiers(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleService = (val: string) => {
    setSelectedServices(prev =>
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
    );
  };

  const toggleAll = () => {
    setSelectedServices(prev =>
      prev.length === SERVICE_KEYS.length ? [] : [...SERVICE_KEYS]
    );
  };

  const handleAddressChange = (val: string) => {
    setAddress(val);
    if (suggestDebounce.current) clearTimeout(suggestDebounce.current);
    if (val.length < 4) { setSuggestions([]); setShowSuggestions(false); return; }
    suggestDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=5&countrycodes=ca&addressdetails=1`,
          { headers: { 'Accept-Language': 'fr' } }
        );
        const data = await res.json();
        setSuggestions(data.map((d: any) => d.display_name));
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 350);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const addr = address.trim();
    if (addr && selectedServices.length > 0 && !isSearching) {
      setIsSearching(true);
      setTimeout(() => {
        const serviceText = selectedServices.length === SERVICE_KEYS.length
          ? t.allServices
          : selectedServices.map(v => t.services[v]).join(', ');
        onSearch({ address: addr, service: serviceText, serviceTypes: selectedServices });
        setIsSearching(false);
      }, 1500);
    }
  };

  const servicesLabel = () => {
    if (selectedServices.length === 0) return t.servicePlaceholder;
    if (selectedServices.length === SERVICE_KEYS.length) return t.allServices;
    if (selectedServices.length === 1) return t.services[selectedServices[0]] ?? '';
    return t.nServices(selectedServices.length);
  };

  return (
    <div className="size-full relative overflow-hidden bg-[#07111f]">

      {/* ── Intro animation overlay ── */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0A1628] via-[#1a2842] to-[#0A1628]"
          >
            <div className="max-w-3xl px-8 text-center">
              <motion.div
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
                className="flex justify-center mb-10"
              >
                <div className="rounded-full flex items-center justify-center"
                  style={{ width: '160px', height: '160px', background: 'white', boxShadow: '0 0 80px rgba(212,175,55,0.2), 0 24px 64px rgba(0,0,0,0.5)' }}>
                  <img src={logoImage} alt="Aurevia" className="w-32 h-32 object-contain" />
                </div>
              </motion.div>
              <motion.h1
                initial={{ y: 32, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.9 }}
                className="text-4xl md:text-5xl text-white mb-6 leading-tight font-light"
              >
                {t.animHeadline}
              </motion.h1>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.8, duration: 0.8 }}
                className="text-xl text-white/75 mb-3">
                {t.animStat1}
              </motion.p>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2.4, duration: 0.8 }}
                className="text-lg text-[#D4AF37]">
                {t.animStat2}
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ delay: 4.5, duration: 1 }}
                className="mt-12 flex items-center justify-center gap-2 text-white/50 text-sm">
                <div className="size-2 bg-[#D4AF37] rounded-full animate-pulse" />
                <span>{t.loadingInterface}</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search loading overlay ── */}
      <AnimatePresence>
        {isSearching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-[#07111f]/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6">
              <div className="relative flex items-center justify-center" style={{ width: '120px', height: '120px' }}>
                <motion.div className="absolute rounded-full"
                  style={{ width: '120px', height: '120px', background: 'conic-gradient(from 0deg, transparent 25%, rgba(212,175,55,0.6) 50%, transparent 75%)', filter: 'blur(12px)' }}
                  animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
                <div className="relative rounded-full flex items-center justify-center"
                  style={{ width: '90px', height: '90px', background: 'white', boxShadow: '0 0 40px rgba(212,175,55,0.2)' }}>
                  <img src={logoImage} alt="" className="w-16 h-16 object-contain" />
                </div>
              </div>
              <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="text-white text-base tracking-wide">
                {t.searching}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero photo ── */}
      <div className="absolute inset-0">
        <img src={HERO_URL} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(7,17,31,0.72) 0%, rgba(7,17,31,0.35) 40%, rgba(7,17,31,0.55) 100%)'
        }} />
      </div>

      {/* ── Page content ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showAnimation ? 0 : 1 }}
        transition={{ duration: 0.9 }}
        className="relative z-10 flex flex-col h-full"
      >
        {/* ── Nav ── */}
        <nav className="flex items-center justify-between px-10 py-6">

          {/* Left: logo + language toggle */}
          <div className="flex items-center gap-4">
            <img src={logoImage} alt="Aurevia Concierge" className="h-16 w-auto object-contain" />
            <LanguageToggle variant="dark" />
          </div>

          {/* Right: platform label + urgent + dossiers + favorites */}
          <div className="flex items-center gap-3">
            <span className="text-white/50 text-xs tracking-widest uppercase">{t.platformLabel}</span>
            <div className="w-px h-4 bg-white/20" />

            {/* ── Urgent inline button ── */}
            {onUrgent && (
              <button
                onClick={onUrgent}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all group"
                style={{
                  border:     '1px solid rgba(239,68,68,0.3)',
                  color:      'rgba(239,68,68,0.75)',
                  background: 'rgba(239,68,68,0.07)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.55)';
                  (e.currentTarget as HTMLElement).style.background  = 'rgba(239,68,68,0.14)';
                  (e.currentTarget as HTMLElement).style.color       = 'rgba(239,68,68,1)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.3)';
                  (e.currentTarget as HTMLElement).style.background  = 'rgba(239,68,68,0.07)';
                  (e.currentTarget as HTMLElement).style.color       = 'rgba(239,68,68,0.75)';
                }}
              >
                {/* Pulsing dot */}
                <span
                  className="size-1.5 rounded-full shrink-0"
                  style={{
                    background: 'rgba(239,68,68,0.9)',
                    boxShadow:  '0 0 6px rgba(239,68,68,0.7)',
                    animation:  'urgent-dot-ping 2s ease-in-out infinite',
                  }}
                />
                <style>{`@keyframes urgent-dot-ping{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(0.7)}}`}</style>
                <Zap className="size-3.5 fill-current" />
                <span className="text-[11px] font-semibold tracking-wide">
                  {lang === 'fr' ? 'Urgent' : 'Urgent'}
                </span>
              </button>
            )}

            <div className="w-px h-4 bg-white/20" />

            {/* ── Mes Dossiers button + dropdown ── */}
            <div ref={dossiersRef} className="relative">
              <button
                onClick={() => setShowDossiers(v => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:bg-white/10"
                style={{ border: `1px solid ${showDossiers ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)'}` }}
              >
                <FolderOpen
                  className="size-3.5"
                  style={{ color: showDossiers ? 'white' : 'rgba(255,255,255,0.55)' }}
                />
                <span
                  className="text-xs tracking-widest uppercase transition-colors"
                  style={{ color: showDossiers ? 'white' : 'rgba(255,255,255,0.55)' }}
                >
                  {nav.dossiers}
                </span>
                {activeDossiers.length > 0 && (
                  <span
                    className="size-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ background: 'rgba(212,175,55,0.9)', color: '#0A1628' }}
                  >
                    {activeDossiers.length}
                  </span>
                )}
              </button>

              {/* ── Dossiers dropdown ── */}
              <AnimatePresence>
                {showDossiers && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 mt-3 z-30 overflow-hidden"
                    style={{
                      width: '380px',
                      borderRadius: '18px',
                      background: 'rgba(8, 16, 32, 0.97)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    {/* Dropdown header */}
                    <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.25)' }}>
                            <FolderOpen className="size-3.5" style={{ color: '#D4AF37' }} />
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold leading-tight">{nav.dossiers}</p>
                            <p className="text-white/35 text-[11px] mt-0.5">{nav.activeCount(activeDossiers.length)}</p>
                          </div>
                        </div>
                        {/* Thin gold rule */}
                        <div style={{ width: '32px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5))' }} />
                      </div>
                    </div>

                    {/* Dossier list */}
                    <div className="py-2">
                      {MOCK_DOSSIERS.map((d, i) => {
                        const meta = STATUS_META[d.status];
                        const updated = UPDATED_LABELS[d.updatedKey][lang];
                        const statusLabel = meta[lang];
                        return (
                          <motion.div
                            key={d.id}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.055 }}
                            className="group relative flex items-center gap-3.5 px-5 py-3.5 transition-all cursor-default"
                            style={{ borderBottom: i < MOCK_DOSSIERS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            {/* Left gold accent bar */}
                            <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: `linear-gradient(180deg, ${meta.color}80, ${meta.color}20)` }} />

                            {/* Status dot */}
                            <div className="size-2 rounded-full shrink-0 mt-0.5"
                              style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}60` }} />

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium leading-tight truncate">{d.address}</p>
                              <p className="text-white/35 text-[11px] mt-0.5 truncate">{d.city}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <div className="flex items-center gap-1">
                                  <Users className="size-3" style={{ color: '#D4AF37' }} />
                                  <span className="text-[11px] font-medium" style={{ color: '#D4AF37' }}>
                                    {nav.experts(d.experts)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-white/25">
                                  <Clock className="size-3" />
                                  <span className="text-[10px]">{updated}</span>
                                </div>
                              </div>

                              {/* Aurevia provider pills */}
                              {(DOSSIER_PROVIDERS[d.id] ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {(DOSSIER_PROVIDERS[d.id] ?? []).slice(0, 4).map((p, pi) => (
                                    <span
                                      key={pi}
                                      className="inline-flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 rounded-full"
                                      style={{
                                        background: 'rgba(212,175,55,0.08)',
                                        border:     '1px solid rgba(212,175,55,0.18)',
                                        color:      'rgba(212,175,55,0.75)',
                                      }}
                                    >
                                      <span className="text-[10px] leading-none">
                                        {CATEGORY_EMOJI[p.category] ?? '🔧'}
                                      </span>
                                      {p.name.split(' ').slice(0, 2).join(' ')}
                                    </span>
                                  ))}
                                  {(DOSSIER_PROVIDERS[d.id] ?? []).length > 4 && (
                                    <span
                                      className="inline-flex items-center text-[9px] font-medium px-2 py-0.5 rounded-full"
                                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
                                    >
                                      +{(DOSSIER_PROVIDERS[d.id] ?? []).length - 4}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Status badge + access */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <span
                                className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}
                              >
                                {statusLabel}
                              </span>
                              <button
                                onClick={() => {
                                  setShowDossiers(false);
                                  if (onDossier) {
                                    onDossier(d.id);
                                  } else {
                                    toast.success(lang === 'fr'
                                      ? `Ouverture du dossier — ${d.address}`
                                      : `Opening file — ${d.address}`
                                    );
                                  }
                                }}
                                className="flex items-center gap-1 text-[11px] font-medium transition-all opacity-0 group-hover:opacity-100"
                                style={{ color: 'rgba(255,255,255,0.5)' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                              >
                                {nav.access}
                                <ArrowRight className="size-3" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button
                        onClick={() => {
                          setShowDossiers(false);
                          toast.success(lang === 'fr' ? 'Création d\'un nouveau dossier...' : 'Creating a new file...');
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all hover:bg-white/8"
                        style={{ border: '1px dashed rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)' }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.4)';
                          (e.currentTarget as HTMLElement).style.color = '#D4AF37';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
                          (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)';
                        }}
                      >
                        {nav.newDossier}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-4 bg-white/20" />

            {/* Favorites */}
            <button
              onClick={onFavorites}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:bg-white/10"
              style={{ border: '1px solid rgba(212,175,55,0.35)' }}
            >
              <Heart
                className="size-3.5"
                style={{ fill: favorites.length > 0 ? '#D4AF37' : 'transparent', color: '#D4AF37' }}
              />
              <span className="text-[#D4AF37] text-xs tracking-widest uppercase">{t.favorites}</span>
              {favorites.length > 0 && (
                <span className="size-5 rounded-full flex items-center justify-center text-[10px] font-bold text-[#0A1628]"
                  style={{ background: '#D4AF37' }}>
                  {favorites.length}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* ── Hero content ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: showAnimation ? 0 : 1, y: showAnimation ? 28 : 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="text-center mb-10"
          >
            <h1 className="text-white font-light mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
              {t.heroTitle}<br />
              <span style={{ color: '#D4AF37' }}>{t.heroTitleHighlight}</span>
            </h1>
            <p className="text-white/55 text-base tracking-wide">{t.heroSubtitle}</p>
          </motion.div>

          {/* ── Search bar ── */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showAnimation ? 0 : 1, y: showAnimation ? 20 : 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            onSubmit={handleSubmit}
            className="w-full"
            style={{ maxWidth: '820px' }}
          >
            <div className="flex rounded-2xl overflow-visible shadow-2xl" style={{ background: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>

              {/* Service selector */}
              <div ref={dropdownRef} className="relative flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(o => !o)}
                  className="w-full h-full flex items-center gap-3 px-6 py-5 text-left hover:bg-gray-50/80 transition-colors rounded-l-2xl"
                >
                  <Search className="size-5 shrink-0" style={{ color: '#D4AF37' }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-[#0A1628]/40 uppercase tracking-widest mb-0.5">{t.serviceLabel}</p>
                    <p className={`text-sm truncate ${selectedServices.length > 0 ? 'text-[#0A1628] font-medium' : 'text-[#0A1628]/40'}`}>
                      {servicesLabel()}
                    </p>
                  </div>
                  <ChevronDown className={`size-4 text-[#0A1628]/30 shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      style={{ width: '300px' }}
                    >
                      <button type="button" onClick={toggleAll}
                        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-100">
                        <div className={`size-5 rounded flex items-center justify-center border-2 transition-colors ${selectedServices.length === SERVICE_KEYS.length ? 'bg-[#0A1628] border-[#0A1628]' : 'border-gray-200'}`}>
                          {selectedServices.length === SERVICE_KEYS.length && <Check className="size-3 text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-sm font-semibold text-[#0A1628]">{t.allServices}</span>
                      </button>
                      <div className="py-2 max-h-72 overflow-y-auto">
                        {SERVICE_KEYS.map(key => {
                          const checked = selectedServices.includes(key);
                          return (
                            <button key={key} type="button" onClick={() => toggleService(key)}
                              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                              <div className={`size-5 rounded flex items-center justify-center border-2 transition-colors shrink-0 ${checked ? 'bg-[#0A1628] border-[#0A1628]' : 'border-gray-200'}`}>
                                {checked && <Check className="size-3 text-white" strokeWidth={3} />}
                              </div>
                              <span className={`text-sm ${checked ? 'text-[#0A1628] font-medium' : 'text-[#0A1628]/70'}`}>{t.services[key]}</span>
                              {checked && <div className="ml-auto size-1.5 rounded-full bg-[#D4AF37]" />}
                            </button>
                          );
                        })}
                      </div>
                      {selectedServices.length > 0 && (
                        <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
                          <span className="text-xs text-[#0A1628]/50">{t.nSelected(selectedServices.length)}</span>
                          <button type="button" onClick={() => setIsDropdownOpen(false)}
                            className="text-xs font-semibold text-[#0A1628] hover:text-[#D4AF37] transition-colors">
                            {t.confirm}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div className="w-px self-stretch my-4 bg-gray-200 shrink-0" />

              {/* Address */}
              <div className="flex-1 min-w-0 flex items-center gap-3 px-6 py-5 relative">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-[#0A1628]/40 uppercase tracking-widest mb-0.5">{t.addressLabel}</p>
                  <input
                    ref={addressInputRef}
                    type="text"
                    value={address}
                    onChange={e => handleAddressChange(e.target.value)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder={t.addressPlaceholder}
                    className="w-full text-sm text-[#0A1628] placeholder-[#0A1628]/35 bg-transparent border-none outline-none"
                  />
                </div>
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 w-full"
                    >
                      {suggestions.map((s, i) => (
                        <button key={i} type="button"
                          onMouseDown={() => { setAddress(s); setSuggestions([]); setShowSuggestions(false); }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0">
                          <MapPin className="size-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                          <span className="text-xs text-[#0A1628]/80 leading-snug line-clamp-2">{s}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit */}
              <div className="p-3 flex items-center shrink-0">
                <button type="submit"
                  disabled={selectedServices.length === 0 || isSearching}
                  className="flex items-center gap-2.5 px-7 py-4 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #0A1628, #1a2842)' }}>
                  <Search className="size-4" />
                  {t.searchButton}
                </button>
              </div>
            </div>

            <p className="text-center text-white/35 text-xs mt-4 tracking-wide">{t.searchHint}</p>
          </motion.form>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: showAnimation ? 0 : 1, y: showAnimation ? 16 : 0 }}
            transition={{ duration: 0.9, delay: 0.45 }}
            className="flex items-center gap-8 mt-14"
          >
            {[
              { n: '45 min', desc: t.stat1Desc },
              { n: '2 min', desc: t.stat2Desc },
              { n: '500+', desc: t.stat3Desc },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-2xl font-light" style={{ color: '#D4AF37' }}>{s.n}</p>
                  <p className="text-white/45 text-xs tracking-wider uppercase mt-0.5">{s.desc}</p>
                </div>
                {i < 2 && <div className="w-px h-8 bg-white/15" />}
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
