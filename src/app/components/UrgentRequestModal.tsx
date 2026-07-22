import { useState, useEffect } from 'react';
import { X, Zap, MapPin, CheckCircle2, Clock, Phone, CalendarClock, Search, Bell, ChevronRight } from 'lucide-react';
import { DualRatingTooltip } from './DualRatingTooltip';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { SchedulingModal, SchedulingProvider } from './SchedulingModal';

// ── Static data ───────────────────────────────────────────────────────────────

const SERVICE_OPTIONS = [
  { key: 'inspection',   emoji: '🔍', fr: 'Inspection',    en: 'Inspection'   },
  { key: 'photo',        emoji: '📷', fr: 'Photographie',  en: 'Photography'  },
  { key: 'evaluation',   emoji: '📋', fr: 'Évaluation',    en: 'Appraisal'    },
  { key: 'notaire',      emoji: '⚖️', fr: 'Notaire',       en: 'Notary'       },
  { key: 'home-staging', emoji: '🏠', fr: 'Home Staging',  en: 'Staging'      },
  { key: 'nettoyage',    emoji: '✨', fr: 'Nettoyage',     en: 'Cleaning'     },
];

const RADIUS_OPTIONS = [5, 10, 25, 50];

const NOTIFY_PROVIDERS = [
  'L. Bernard', 'M. Tremblay', 'S. Gagnon', 'P. Roy',
  'A. Côté', 'J. Martin', 'C. Lefebvre', 'F. Bouchard',
];

// Providers per service category for the 72h browse mode
const BROWSE_POOL: Record<string, Array<{ name: string; phone: string; rating: number; reviewCount: number }>> = {
  inspection: [
    { name: 'Inspection Bâtiment Pro Québec', phone: '(514) 979-5522', rating: 4.9, reviewCount: 87 },
    { name: 'Expertbâti Inspection',          phone: '(450) 688-3311', rating: 4.7, reviewCount: 62 },
    { name: 'Inspecta-Maison',                phone: '(514) 233-8877', rating: 4.8, reviewCount: 43 },
    { name: 'Inspection Diligente MTL',       phone: '(514) 556-1100', rating: 4.6, reviewCount: 119 },
  ],
  photo: [
    { name: 'Lumière & Propriété Photographie', phone: '(514) 902-3344', rating: 4.9, reviewCount: 203 },
    { name: 'Visions Immobilières',             phone: '(438) 312-9900', rating: 4.7, reviewCount: 88  },
    { name: 'Photos HD Prestige',               phone: '(514) 781-5567', rating: 4.8, reviewCount: 178 },
    { name: 'Studio Panorama Immobilier',       phone: '(514) 664-2238', rating: 4.6, reviewCount: 54  },
  ],
  evaluation: [
    { name: 'Évaluation Immobilière Gagnon',  phone: '(514) 288-4455', rating: 4.8, reviewCount: 124 },
    { name: 'Experts Évaluateurs du Québec',  phone: '(514) 595-3322', rating: 4.7, reviewCount: 91  },
    { name: 'Agréé Évaluation Lapointe',      phone: '(514) 271-7788', rating: 4.9, reviewCount: 67  },
    { name: 'Cabinet Roy & Associés',         phone: '(514) 362-9900', rating: 4.6, reviewCount: 45  },
  ],
  notaire: [
    { name: 'Étude Notariale Bergeron & Ass.', phone: '(514) 844-7200', rating: 4.9, reviewCount: 211 },
    { name: 'Me Sophie Tremblay, Notaire',     phone: '(514) 527-3390', rating: 4.8, reviewCount: 156 },
    { name: 'Notaires du Plateau',             phone: '(514) 521-6611', rating: 4.7, reviewCount: 98  },
    { name: 'Étude Notariale Côté-Leblanc',   phone: '(514) 739-4400', rating: 4.6, reviewCount: 72  },
  ],
  'home-staging': [
    { name: 'Staging Prestige Montréal',   phone: '(514) 836-4521', rating: 4.8, reviewCount: 156 },
    { name: 'Mise en Scène Immobilière',   phone: '(514) 723-8890', rating: 4.7, reviewCount: 84  },
    { name: 'Élite Home Staging',          phone: '(438) 495-2210', rating: 4.9, reviewCount: 112 },
    { name: 'Décor & Vente Experts',       phone: '(514) 601-7743', rating: 4.6, reviewCount: 48  },
  ],
  nettoyage: [
    { name: 'Nettoyage Prestige Immobilier', phone: '(514) 366-8811', rating: 4.8, reviewCount: 143 },
    { name: 'Éclat Propre Services',         phone: '(514) 721-5544', rating: 4.7, reviewCount: 77  },
    { name: 'Pro-Net Résidentiel MTL',       phone: '(438) 800-4422', rating: 4.6, reviewCount: 55  },
    { name: 'Nettoyage Express Montréal',    phone: '(514) 593-7700', rating: 4.5, reviewCount: 38  },
  ],
};

// ── 72h slot generation ───────────────────────────────────────────────────────

type SlotUrgency = 'today' | 'tomorrow' | 'day2';

interface AvailableSlot { label: string; urgency: SlotUrgency }

const SLOT_SETS: AvailableSlot[][] = [
  [ { label: 'Auj. 16:00', urgency: 'today' }, { label: 'Dem. 9:00',   urgency: 'tomorrow' }, { label: 'Dem. 13:30', urgency: 'tomorrow' } ],
  [ { label: 'Dem. 8:30',  urgency: 'tomorrow' }, { label: 'Dem. 10:00', urgency: 'tomorrow' }, { label: 'Dans 2j 9:30',  urgency: 'day2' } ],
  [ { label: 'Dem. 13:00', urgency: 'tomorrow' }, { label: 'Dem. 14:30', urgency: 'tomorrow' }, { label: 'Dans 2j 11:00', urgency: 'day2' } ],
  [ { label: 'Dans 2j 9:00', urgency: 'day2' }, { label: 'Dans 2j 11:30', urgency: 'day2' }, { label: 'Dans 2j 15:00', urgency: 'day2' } ],
];

const URGENCY_STYLE: Record<SlotUrgency, { bg: string; color: string; border: string }> = {
  today:    { bg: 'rgba(52,211,153,0.12)',  color: '#34D399', border: 'rgba(52,211,153,0.3)'  },
  tomorrow: { bg: 'rgba(251,191,36,0.12)',  color: '#FBBF24', border: 'rgba(251,191,36,0.3)'  },
  day2:     { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: 'rgba(255,255,255,0.1)' },
};

interface BrowseProvider {
  id:          string;
  name:        string;
  phone:       string;
  category:    string;
  rating:      number;
  reviewCount: number;
  distance:    number;
  slots:       AvailableSlot[];
}

function buildBrowseProviders(serviceKey: string, radius: number): BrowseProvider[] {
  const pool = BROWSE_POOL[serviceKey] ?? [];
  return pool.map((p, i) => ({
    id:          `urg-${serviceKey}-${i}`,
    name:        p.name,
    phone:       p.phone,
    category:    serviceKey,
    rating:      p.rating,
    reviewCount: p.reviewCount,
    distance:    parseFloat((0.4 + (i * 1.3 + (i % 3) * 0.7)).toFixed(1)),
    slots:       SLOT_SETS[i % SLOT_SETS.length],
  })).filter(p => p.distance <= radius);
}

// ── FAB ───────────────────────────────────────────────────────────────────────

export function UrgentFAB({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.3 }}
      onClick={onClick}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-[84px] right-6 z-40 flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-full"
      style={{ background: 'linear-gradient(135deg, #B91C1C, #EF4444)', boxShadow: '0 8px 28px rgba(239,68,68,0.45)' }}
    >
      <span className="absolute inset-0 rounded-full"
        style={{ animation: 'urgent-ping 2s cubic-bezier(0,0,0.2,1) infinite', background: 'rgba(239,68,68,0.35)' }} />
      <style>{`@keyframes urgent-ping{0%{transform:scale(1);opacity:.6}70%,100%{transform:scale(1.32);opacity:0}}`}</style>
      <Zap className="size-4 fill-white text-white relative z-10" />
      <span className="text-white text-[13px] font-bold tracking-wide relative z-10">Urgent</span>
    </motion.button>
  );
}

// ── Browse provider card ──────────────────────────────────────────────────────

function BrowseCard({
  provider, onSchedule, lang,
}: { provider: BrowseProvider; onSchedule: (p: BrowseProvider) => void; lang: string }) {
  const earliest = provider.slots[0];
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-stretch">
        {/* Left gold accent bar — urgency tinted */}
        <div className="w-1 shrink-0 rounded-l-2xl"
          style={{ background: `linear-gradient(180deg, ${URGENCY_STYLE[earliest.urgency].color}, transparent)` }} />

        <div className="flex-1 p-4">
          {/* Name + rating row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-white text-sm font-semibold leading-snug">{provider.name}</p>
            <div className="shrink-0">
              <DualRatingTooltip
                provider={{ id: provider.id, rating: provider.rating, reviewCount: provider.reviewCount, category: provider.category }}
                dark
              />
            </div>
          </div>

          {/* Distance */}
          <p className="text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <MapPin className="size-2.5 inline mr-1" />{provider.distance} km
          </p>

          {/* Slot chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {provider.slots.map((slot, i) => {
              const st = URGENCY_STYLE[slot.urgency];
              return (
                <span key={i}
                  className="text-[10px] font-semibold px-2 py-1 rounded-full"
                  style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                  {slot.label}
                </span>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => onSchedule(provider)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #B8962F)', color: '#07111f' }}
            >
              <CalendarClock className="size-3.5" />
              {lang === 'fr' ? 'Planifier' : 'Book'}
            </motion.button>
            <a href={`tel:${provider.phone}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Phone className="size-3.5" />
              {provider.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

type UrgentMode  = 'notify' | 'browse';
type NotifyPhase = 'form' | 'sent';
type BrowsePhase = 'form' | 'searching' | 'results';

export function UrgentRequestModal({ onClose }: { onClose: () => void }) {
  const { lang } = useLanguage();

  // Shared
  const [mode, setMode]       = useState<UrgentMode>('browse');
  const [service, setService] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [radius, setRadius]   = useState(10);

  // Notify mode
  const [notifyPhase, setNotifyPhase] = useState<NotifyPhase>('form');
  const [countdown, setCountdown]     = useState(300);
  const [notified, setNotified]       = useState(0);

  // Browse mode
  const [browsePhase, setBrowsePhase]   = useState<BrowsePhase>('form');
  const [browseResults, setBrowseResults] = useState<BrowseProvider[]>([]);

  // Nested scheduling modal
  const [schedulingProvider, setSchedulingProvider] = useState<SchedulingProvider | null>(null);

  // Countdown + provider reveal
  useEffect(() => {
    if (notifyPhase !== 'sent') return;
    const cd = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    let count = 0;
    const rev = setInterval(() => { count++; setNotified(count); if (count >= NOTIFY_PROVIDERS.length) clearInterval(rev); }, 280);
    return () => { clearInterval(cd); clearInterval(rev); };
  }, [notifyPhase]);

  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');
  const urgent = countdown < 60;

  const canSearch = !!service;

  const handleNotifySend = () => {
    if (!service) return;
    setNotifyPhase('sent');
  };

  const handleBrowseSearch = () => {
    if (!service) return;
    setBrowsePhase('searching');
    setTimeout(() => {
      const results = buildBrowseProviders(service, radius);
      setBrowseResults(results);
      setBrowsePhase('results');
    }, 1100);
  };

  const handleModeSwitch = (m: UrgentMode) => {
    setMode(m);
    setNotifyPhase('form');
    setBrowsePhase('form');
    setBrowseResults([]);
    setNotified(0);
    setCountdown(300);
  };

  const s = lang === 'fr' ? {
    title:        'Demande Urgente',
    modeNotify:   'Notifier les prestataires',
    modeBrowse:   'Disponibles dans 72h',
    serviceLabel: 'Service requis',
    addressLabel: 'Adresse (optionnel)',
    addressHolder:'Ex : 700, rue des Éclaircies, Montréal',
    radiusLabel:  'Rayon de recherche',
    notifyBtn:    'Envoyer la demande urgente',
    browseBtn:    'Rechercher les disponibilités',
    cancelBtn:    'Annuler',
    sentTitle:    'Demande envoyée !',
    sentSub:      (n: number, r: number) => `${n} prestataire${n > 1 ? 's' : ''} notifié${n > 1 ? 's' : ''} dans un rayon de ${r} km`,
    countdownLabel:'Réponse attendue dans',
    cancelRequest:'Annuler la demande',
    searching:    'Recherche des disponibilités…',
    resultsTitle: (n: number) => `${n} prestataire${n > 1 ? 's' : ''} disponible${n > 1 ? 's' : ''} dans 72h`,
    noResults:    'Aucun prestataire disponible dans ce rayon.',
    widenRadius:  'Élargir le rayon',
    km:           'km',
    selectFirst:  'Sélectionnez un service',
    backToForm:   'Modifier la recherche',
    radiusFrom:   'Rayon depuis :',
  } : {
    title:        'Urgent Request',
    modeNotify:   'Notify providers',
    modeBrowse:   'Available in 72h',
    serviceLabel: 'Required service',
    addressLabel: 'Address (optional)',
    addressHolder:'Ex: 700 Rue des Éclaircies, Montreal',
    radiusLabel:  'Search radius',
    notifyBtn:    'Send urgent request',
    browseBtn:    'Search availability',
    cancelBtn:    'Cancel',
    sentTitle:    'Request sent!',
    sentSub:      (n: number, r: number) => `${n} provider${n > 1 ? 's' : ''} notified within ${r} km`,
    countdownLabel:'Expected response in',
    cancelRequest:'Cancel request',
    searching:    'Searching availability…',
    resultsTitle: (n: number) => `${n} provider${n > 1 ? 's' : ''} available within 72h`,
    noResults:    'No providers available in this radius.',
    widenRadius:  'Widen radius',
    km:           'km',
    selectFirst:  'Select a service',
    backToForm:   'Edit search',
    radiusFrom:   'Radius from:',
  };

  const serviceEmoji = SERVICE_OPTIONS.find(o => o.key === service)?.emoji ?? '';
  const serviceLabel = SERVICE_OPTIONS.find(o => o.key === service)?.[lang === 'fr' ? 'fr' : 'en'] ?? '';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 flex items-center justify-center z-[1400] px-4"
        style={{ background: 'rgba(3,6,14,0.88)', backdropFilter: 'blur(14px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 22 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 22 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full flex flex-col rounded-3xl overflow-hidden"
          style={{
            maxWidth: '500px',
            maxHeight: '88vh',
            background: '#0A1220',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 48px 96px rgba(0,0,0,0.82)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Top gradient bar ── */}
          <div className="h-1 w-full shrink-0"
            style={{ background: 'linear-gradient(90deg, #B91C1C, #EF4444, #F97316)' }} />

          {/* ── Fixed header ── */}
          <div className="px-6 pt-5 pb-4 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Title row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <Zap className="size-4 fill-red-400 text-red-400" />
                </div>
                <div>
                  <h2 className="text-white text-base font-semibold leading-tight">{s.title}</h2>
                  {service && (
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {serviceEmoji} {serviceLabel} · {radius} {s.km}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors">
                <X className="size-4" />
              </button>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {(['browse', 'notify'] as UrgentMode[]).map(m => {
                const active = mode === m;
                const Icon   = m === 'browse' ? Search : Bell;
                const label  = m === 'browse' ? s.modeBrowse : s.modeNotify;
                return (
                  <motion.button
                    key={m}
                    onClick={() => handleModeSwitch(m)}
                    layout
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold relative transition-colors"
                    style={{ color: active ? (m === 'notify' ? '#FCA5A5' : '#D4AF37') : 'rgba(255,255,255,0.38)' }}
                  >
                    {active && (
                      <motion.div layoutId="mode-bg" className="absolute inset-0 rounded-lg"
                        style={{ background: m === 'notify' ? 'rgba(239,68,68,0.15)' : 'rgba(212,175,55,0.1)', border: `1px solid ${m === 'notify' ? 'rgba(239,68,68,0.3)' : 'rgba(212,175,55,0.25)'}` }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                    )}
                    <Icon className="size-3.5 relative z-10" />
                    <span className="relative z-10">{label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">

              {/* ════ NOTIFY MODE ════ */}
              {mode === 'notify' && (
                <motion.div key="notify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <AnimatePresence mode="wait">

                    {notifyPhase === 'form' && (
                      <motion.div key="n-form" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-5">
                        {/* Service chips */}
                        <div>
                          <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.32)' }}>{s.serviceLabel}</p>
                          <div className="grid grid-cols-3 gap-2">
                            {SERVICE_OPTIONS.map(opt => {
                              const active = service === opt.key;
                              return (
                                <button key={opt.key} onClick={() => setService(opt.key)}
                                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                                  style={{ background: active ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.07)'}`, color: active ? '#FCA5A5' : 'rgba(255,255,255,0.55)' }}>
                                  <span className="text-base">{opt.emoji}</span>
                                  <span className="text-xs">{lang === 'fr' ? opt.fr : opt.en}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        {/* Address */}
                        <div>
                          <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.32)' }}>{s.addressLabel}</p>
                          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <MapPin className="size-4 shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
                            <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder={s.addressHolder}
                              className="flex-1 bg-transparent text-white text-sm outline-none" style={{ caretColor: '#EF4444' }} />
                          </div>
                        </div>
                        {/* Radius */}
                        <div>
                          <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.32)' }}>{s.radiusLabel}</p>
                          <div className="flex gap-2">
                            {RADIUS_OPTIONS.map(r => (
                              <button key={r} onClick={() => setRadius(r)} className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                                style={{ background: radius === r ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.04)', border: `1px solid ${radius === r ? 'rgba(239,68,68,0.45)' : 'rgba(255,255,255,0.07)'}`, color: radius === r ? '#FCA5A5' : 'rgba(255,255,255,0.45)' }}>
                                {r} {s.km}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* CTA */}
                        <motion.button whileTap={service ? { scale: 0.97 } : {}} onClick={handleNotifySend}
                          className="w-full py-4 rounded-xl text-sm font-bold tracking-wide flex items-center justify-center gap-2.5"
                          style={{ background: service ? 'linear-gradient(135deg,#B91C1C,#EF4444)' : 'rgba(239,68,68,0.1)', color: service ? 'white' : 'rgba(239,68,68,0.35)', cursor: service ? 'pointer' : 'default', boxShadow: service ? '0 4px 24px rgba(239,68,68,0.35)' : 'none' }}>
                          <Zap className="size-4 fill-current" />
                          {s.notifyBtn}
                        </motion.button>
                      </motion.div>
                    )}

                    {notifyPhase === 'sent' && (
                      <motion.div key="n-sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-5">
                        <div className="flex items-center gap-3">
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                            className="size-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
                            <CheckCircle2 className="size-4 text-emerald-400" />
                          </motion.div>
                          <div>
                            <p className="text-white text-sm font-semibold">{s.sentTitle}</p>
                            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.38)' }}>{s.sentSub(notified, radius)}</p>
                          </div>
                        </div>
                        {/* Provider dots */}
                        <div className="relative rounded-2xl p-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', minHeight: '100px' }}>
                          {[1,2,3].map(i => (
                            <motion.div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                              initial={{ scale: 0, opacity: 0.6 }} animate={{ scale: [0, 2.5], opacity: [0.5, 0] }}
                              transition={{ duration: 2.5, delay: i * 0.5, repeat: Infinity, ease: 'easeOut' }}
                              style={{ width: '50px', height: '50px', border: '1px solid rgba(239,68,68,0.4)' }} />
                          ))}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-3 rounded-full bg-red-500" />
                          <div className="relative z-10 flex flex-wrap justify-center gap-2">
                            {NOTIFY_PROVIDERS.slice(0, notified).map(name => (
                              <motion.div key={name} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}>
                                <span className="size-1.5 rounded-full animate-pulse" style={{ background: '#34D399' }} />
                                <span className="text-[10px] font-medium" style={{ color: '#34D399' }}>{name}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                        {/* Countdown */}
                        <div className="flex flex-col items-center py-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${urgent ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="size-3" style={{ color: urgent ? '#EF4444' : 'rgba(255,255,255,0.3)' }} />
                            <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: urgent ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.25)' }}>{s.countdownLabel}</span>
                          </div>
                          <p className="text-3xl font-light tabular-nums" style={{ color: urgent ? '#EF4444' : 'white' }}>{mm}:{ss}</p>
                        </div>
                        <button onClick={() => { onClose(); toast.success(lang === 'fr' ? 'Demande annulée' : 'Request cancelled'); }}
                          className="w-full py-2.5 rounded-xl text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.28)', border: '1px solid rgba(255,255,255,0.07)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.7)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}>
                          {s.cancelRequest}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ════ BROWSE 72H MODE ════ */}
              {mode === 'browse' && (
                <motion.div key="browse" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                  <AnimatePresence mode="wait">

                    {/* Form */}
                    {browsePhase === 'form' && (
                      <motion.div key="b-form" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-5">
                        <div>
                          <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.32)' }}>{s.serviceLabel}</p>
                          <div className="grid grid-cols-3 gap-2">
                            {SERVICE_OPTIONS.map(opt => {
                              const active = service === opt.key;
                              return (
                                <button key={opt.key} onClick={() => setService(opt.key)}
                                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                                  style={{ background: active ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.07)'}`, color: active ? '#D4AF37' : 'rgba(255,255,255,0.55)' }}>
                                  <span className="text-base">{opt.emoji}</span>
                                  <span className="text-xs">{lang === 'fr' ? opt.fr : opt.en}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Address field */}
                        <div>
                          <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.32)' }}>{s.addressLabel}</p>
                          <div
                            className="flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: address
                                ? '1px solid rgba(212,175,55,0.4)'
                                : '1px solid rgba(255,255,255,0.1)',
                              boxShadow: address ? '0 0 0 3px rgba(212,175,55,0.07)' : 'none',
                            }}
                          >
                            <MapPin className="size-4 shrink-0" style={{ color: address ? '#D4AF37' : 'rgba(255,255,255,0.3)' }} />
                            <input
                              type="text"
                              value={address}
                              onChange={e => setAddress(e.target.value)}
                              placeholder={s.addressHolder}
                              className="flex-1 bg-transparent text-white text-sm outline-none"
                              style={{ caretColor: '#D4AF37' }}
                            />
                            {address && (
                              <button onClick={() => setAddress('')} className="text-white/25 hover:text-white/60 transition-colors shrink-0">
                                <X className="size-3.5" />
                              </button>
                            )}
                          </div>
                          {address && (
                            <p className="text-[10px] mt-1.5 ml-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
                              {s.radiusFrom} <span style={{ color: 'rgba(212,175,55,0.7)' }}>{address.split(',')[0]}</span>
                            </p>
                          )}
                        </div>

                        {/* Radius */}
                        <div>
                          <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.32)' }}>{s.radiusLabel}</p>
                          <div className="flex gap-2">
                            {RADIUS_OPTIONS.map(r => (
                              <button key={r} onClick={() => setRadius(r)} className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                                style={{ background: radius === r ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${radius === r ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.07)'}`, color: radius === r ? '#D4AF37' : 'rgba(255,255,255,0.45)' }}>
                                {r} {s.km}
                              </button>
                            ))}
                          </div>
                        </div>
                        <motion.button whileTap={canSearch ? { scale: 0.97 } : {}} onClick={handleBrowseSearch}
                          className="w-full py-4 rounded-xl text-sm font-bold tracking-wide flex items-center justify-center gap-2.5"
                          style={{ background: canSearch ? 'linear-gradient(135deg,#D4AF37,#B8962F)' : 'rgba(212,175,55,0.1)', color: canSearch ? '#07111f' : 'rgba(212,175,55,0.35)', cursor: canSearch ? 'pointer' : 'default', boxShadow: canSearch ? '0 4px 24px rgba(212,175,55,0.28)' : 'none' }}>
                          <Search className="size-4" />
                          {canSearch ? s.browseBtn : s.selectFirst}
                        </motion.button>
                      </motion.div>
                    )}

                    {/* Searching spinner */}
                    {browsePhase === 'searching' && (
                      <motion.div key="b-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="relative size-14">
                          <motion.div className="absolute inset-0 rounded-full"
                            style={{ border: '2px solid rgba(212,175,55,0.15)' }} />
                          <motion.div className="absolute inset-0 rounded-full"
                            style={{ border: '2px solid transparent', borderTopColor: '#D4AF37' }}
                            animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                          <div className="absolute inset-3 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(212,175,55,0.08)' }}>
                            <Search className="size-5" style={{ color: '#D4AF37' }} />
                          </div>
                        </div>
                        <p className="text-sm font-medium animate-pulse" style={{ color: 'rgba(255,255,255,0.55)' }}>{s.searching}</p>
                      </motion.div>
                    )}

                    {/* Results */}
                    {browsePhase === 'results' && (
                      <motion.div key="b-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-4">
                        {/* Results header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold" style={{ color: browseResults.length > 0 ? '#D4AF37' : 'rgba(255,255,255,0.5)' }}>
                              {browseResults.length > 0 ? s.resultsTitle(browseResults.length) : s.noResults}
                            </p>
                            {address && (
                              <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                <MapPin className="size-2.5" />
                                {address.split(',')[0]} · {radius} {s.km}
                              </p>
                            )}
                          </div>
                          <button onClick={() => setBrowsePhase('form')}
                            className="text-[10px] flex items-center gap-1 transition-colors"
                            style={{ color: 'rgba(255,255,255,0.35)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
                            <ChevronRight className="size-3 rotate-180" />
                            {s.backToForm}
                          </button>
                        </div>

                        {/* Slot legend */}
                        {browseResults.length > 0 && (
                          <div className="flex items-center gap-4 flex-wrap">
                            {([['today', lang === 'fr' ? "Aujourd'hui" : 'Today'], ['tomorrow', lang === 'fr' ? 'Demain' : 'Tomorrow'], ['day2', lang === 'fr' ? 'Dans 2 jours' : 'In 2 days']] as [SlotUrgency, string][]).map(([u, label]) => (
                              <div key={u} className="flex items-center gap-1.5">
                                <span className="size-2 rounded-full" style={{ background: URGENCY_STYLE[u].color }} />
                                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Provider cards */}
                        <div className="space-y-3">
                          {browseResults.map((p, i) => (
                            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                              <BrowseCard provider={p} onSchedule={setSchedulingProvider} lang={lang} />
                            </motion.div>
                          ))}
                          {browseResults.length === 0 && (
                            <button onClick={() => { setRadius(RADIUS_OPTIONS[Math.min(RADIUS_OPTIONS.indexOf(radius) + 1, RADIUS_OPTIONS.length - 1)]); setBrowsePhase('form'); }}
                              className="w-full py-3 rounded-xl text-sm font-medium transition-all"
                              style={{ background: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                              {s.widenRadius}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Fixed footer ── */}
          {(browsePhase !== 'results' && notifyPhase !== 'sent') && (
            <div className="px-6 pb-5 pt-1 shrink-0">
              <button onClick={onClose}
                className="w-full py-2.5 rounded-xl text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.25)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>
                {s.cancelBtn}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Nested SchedulingModal */}
      <AnimatePresence>
        {schedulingProvider && (
          <SchedulingModal
            provider={schedulingProvider}
            onClose={() => setSchedulingProvider(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
