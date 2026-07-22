import { useState, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useVersion } from '../contexts/VersionContext';
import { useLanguage } from '../contexts/LanguageContext';

// ── Deterministic data generation ─────────────────────────────────────────────

function hashId(id: string): number {
  return id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

interface DualRatingData {
  googleRating:  number;
  googleCount:   number;
  aureviaRating: number;
  criteria: { price: number; quality: number; speed: number };
}

function computeRatings(id: string, base: number): DualRatingData {
  const s = hashId(id);
  const googleDelta   = ((s % 5) + 1) * 0.1;
  const googleRating  = parseFloat(Math.max(3.5, base - googleDelta).toFixed(1));
  const googleCount   = 40 + (s % 281);
  const aureviaRating = parseFloat(Math.min(5.0, base + (s % 2) * 0.1).toFixed(1));
  const price   = parseFloat((3.8 + (s % 12) / 10).toFixed(1));
  const quality = parseFloat((4.2 + ((s * 3) % 8) / 10).toFixed(1));
  const speed   = parseFloat((4.0 + ((s * 7) % 10) / 10).toFixed(1));
  return { googleRating, googleCount, aureviaRating, criteria: { price, quality, speed } };
}

// Authors are picked independently of the review text so the same author
// doesn't always appear for the same category.
const AUTHORS = [
  { author: 'Marc-André T.',    role: 'Courtier'  },
  { author: 'Sophie L.',        role: 'Courtière' },
  { author: 'Jean-François B.', role: 'Courtier'  },
  { author: 'Isabelle R.',      role: 'Courtière' },
  { author: 'Patrick M.',       role: 'Courtier'  },
  { author: 'Lucie D.',         role: 'Courtière' },
  { author: 'Thomas R.',        role: 'Courtier'  },
  { author: 'Amélie G.',        role: 'Courtière' },
];

const REVIEWS_BY_CATEGORY: Record<string, string[]> = {
  'photo': [
    'Shooting photo terminé en 45 min, photos HDR reçues le soir même. Mon client était ravi.',
    'Rendu exceptionnel — les photos ont vendu la propriété en 48 h. Service ultra-rapide.',
    'Qualité HD irréprochable, photographe ponctuel et discret pendant les visites.',
  ],
  'notaire': [
    'Acte signé dans les délais, très réactif par courriel. Je retravaillerai avec ce notaire.',
    'Dossier traité avec rigueur et clarté, aucun délai supplémentaire. Je recommande.',
    'Explications limpides pour mes clients, formalités réglées sans accroc.',
  ],
  'inspection': [
    "Rapport d'inspection illustré remis en 24 h. Suivi irréprochable, communication parfaite.",
    "Inspection complète en 2 h, rapport très compréhensible qui a facilité la négociation.",
    'Inspecteur méthodique, a détecté des points clés invisibles à l\'œil nu. Excellent.',
  ],
  'home-staging': [
    "Home staging réalisé avec beaucoup de goût. La propriété s'est vendue en 3 jours.",
    'Transformation incroyable — la maison était méconnaissable. Mes clients étaient ravis.',
    'Mise en scène sobre et élégante, parfaitement ciblée pour les acheteurs visés.',
  ],
  'evaluation': [
    'Évaluateur ponctuel et rigoureux. Rapport clair et professionnel. Je retravaillerai avec eux.',
    'Évaluation précise et bien documentée, livrée en 48 h. Service impeccable.',
    'Rapport détaillé qui a facilité la transaction et renforcé la confiance des acheteurs.',
  ],
  'demenagement': [
    'Déménagement impeccable, aucun dommage, équipe professionnelle et parfaitement ponctuelle.',
    'Tout déménagé en 3 h. Efficacité remarquable, je recommande à tous mes clients.',
    'Service rapide et soigné — les meubles sont arrivés en parfait état, sans stress.',
  ],
  'paysager': [
    "Aménagement paysager superbe, la cour transformée a vraiment valorisé la propriété.",
    'Travail soigné et rapide, résultat qui dépasse les attentes à chaque fois.',
    'Excellent sens créatif, le jardin est magnifique et a séduit les acheteurs dès la première visite.',
  ],
  'design': [
    'Design intérieur épuré et moderne, parfaitement adapté aux acheteurs ciblés.',
    'Les recommandations de design ont fait la différence lors des visites. Bravo !',
    'Rendu final élégant qui a considérablement accéléré la vente. Très professionnel.',
  ],
  'nettoyage': [
    'Nettoyage en profondeur — la propriété brillait lors des visites. Excellent travail.',
    'Équipe efficace et discrète, résultat impeccable en quelques heures seulement.',
    'Service irréprochable, les acheteurs ont été impressionnés par la propreté des lieux.',
  ],
  'pisciniste': [
    'Remise en état de la piscine en une journée, parfait pour les visites d\'été.',
    'Technicien ponctuel et efficace — piscine cristalline pour les photos et les visites.',
    'Excellent service, la piscine était en parfait état pour la journée portes ouvertes.',
  ],
  'chocolatier': [
    'Plateau de chocolats artisanaux pour la signature — les clients ont adoré. Belle attention.',
    'Cadeau de bienvenue parfait pour nos acheteurs, présentation soignée et goût exquis.',
    'Une touche premium qui a vraiment marqué nos clients lors de la remise des clés.',
  ],
  'fleuriste': [
    'Arrangements floraux livrés à temps, ils ont créé une atmosphère chaleureuse pour les visites.',
    'Bouquets élégants qui ont embelli la propriété lors de la journée portes ouvertes.',
    'Service floral impeccable, les fleurs fraîches ont fait toute la différence.',
  ],
};

const FALLBACK_REVIEWS = [
  'Service professionnel et ponctuel. Je recommande vivement à mes collègues courtiers.',
  'Excellent prestataire, travail de qualité livré dans les délais. Bravo !',
  'Très satisfait du service rendu, je ferai appel à eux pour mes prochains dossiers.',
];

function pickReview(id: string, category: string) {
  const s    = hashId(id);
  const pool = REVIEWS_BY_CATEGORY[category] ?? FALLBACK_REVIEWS;
  return {
    text:   pool[s % pool.length],
    ...AUTHORS[(s * 3 + 7) % AUTHORS.length],
  };
}

// ── Micro sub-components ───────────────────────────────────────────────────────

function GoogleG() {
  return (
    <div
      className="size-[18px] rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
      style={{ background: 'white', color: '#4285F4' }}
    >
      G
    </div>
  );
}

function AureviaA() {
  return (
    <div
      className="size-[18px] rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
      style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.22), rgba(212,175,55,0.06))',
        color: '#D4AF37',
        border: '1px solid rgba(212,175,55,0.38)',
      }}
    >
      A
    </div>
  );
}

function MiniStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-px">
      {[1, 2, 3, 4, 5].map(i => {
        const full    = i <= Math.floor(value);
        const partial = !full && i - value < 1;
        return (
          <Star
            key={i}
            className="size-[9px]"
            style={{
              fill:  full ? '#D4AF37' : partial ? 'rgba(212,175,55,0.32)' : 'transparent',
              color: full || partial ? '#D4AF37' : 'rgba(255,255,255,0.1)',
            }}
          />
        );
      })}
    </div>
  );
}

function CriterionBar({
  emoji, label, value,
}: { emoji: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] shrink-0 leading-none">{emoji}</span>
      <span
        className="text-[10px] shrink-0"
        style={{ color: 'rgba(255,255,255,0.38)', width: '46px' }}
      >
        {label}
      </span>
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: '3px', background: 'rgba(255,255,255,0.07)' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / 5) * 100}%` }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #C09020, #F0CD6A)' }}
        />
      </div>
      <span
        className="text-[10px] font-bold shrink-0 tabular-nums"
        style={{ color: 'rgba(255,255,255,0.62)', minWidth: '22px', textAlign: 'right' }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export interface DualRatingTooltipProps {
  provider: { id: string; rating: number; reviewCount: number; category: string };
  /** Use on dark backgrounds (dark cards, modals). Defaults to light (white card). */
  dark?: boolean;
}

export function DualRatingTooltip({ provider, dark = false }: DualRatingTooltipProps) {
  const { isAlpha } = useVersion();
  const { lang }    = useLanguage();
  const [visible, setVisible]   = useState(false);
  const [pos, setPos]           = useState({ x: 0, y: 0, above: false });
  const [isMounted, setIsMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Guard createPortal: only render after mount so document.body exists in all envs
  useEffect(() => { setIsMounted(true); }, []);

  const data   = useMemo(() => computeRatings(provider.id, provider.rating), [provider.id, provider.rating]);
  const review = useMemo(() => pickReview(provider.id, provider.category), [provider.id, provider.category]);

  const s = lang === 'fr' ? {
    title:        'Réputation globale',
    googleLabel:  'Avis publics Google',
    aureviaLabel: 'Note réseau Aurevia',
    reviews:      (n: number) => `${n} avis`,
    price:        'Prix',
    quality:      'Qualité',
    speed:        'Rapidité',
    excl:         'EXCL.',
    lastReview:   'Dernier avis courtier',
  } : {
    title:        'Global reputation',
    googleLabel:  'Google public reviews',
    aureviaLabel: 'Aurevia broker rating',
    reviews:      (n: number) => `${n} reviews`,
    price:        'Price',
    quality:      'Quality',
    speed:        'Speed',
    excl:         'EXCL.',
    lastReview:   'Latest broker review',
  };

  const handleEnter = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const estimatedH = isAlpha ? 365 : 235;
    const above = window.innerHeight - rect.bottom < estimatedH + 16;
    setPos({
      x:     rect.left,
      y:     above ? rect.top - estimatedH - 4 : rect.bottom + 8,
      above,
    });
    setVisible(true);
  };

  return (
    <>
      {/* ── Trigger ── */}
      <div
        ref={triggerRef}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setVisible(false)}
        className="flex items-center gap-1 cursor-default group"
        role="button"
        aria-haspopup="true"
      >
        <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
        <span
          className="font-medium transition-colors"
          style={{ color: visible ? '#B8960C' : dark ? 'rgba(255,255,255,0.9)' : '#0A1628' }}
        >
          {provider.rating}
        </span>
        <span className="text-xs" style={{ color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(10,22,40,0.5)' }}>
          ({provider.reviewCount})
        </span>
        {/* Subtle underline hover cue */}
        <span
          className="transition-all duration-300"
          style={{
            display: 'inline-block',
            width: '10px',
            height: '1px',
            background: visible
              ? 'rgba(184,150,12,0.8)'
              : dark ? 'rgba(255,255,255,0.2)' : 'rgba(10,22,40,0.18)',
            borderRadius: '1px',
            marginLeft: '1px',
          }}
        />
      </div>

      {/* ── Tooltip (portal, fixed) — guarded so document.body exists in iframe envs ── */}
      {isMounted && createPortal(
        <AnimatePresence>
          {visible && (
            <motion.div
              key="dual-rating-tooltip"
              initial={{ opacity: 0, y: pos.above ? 6 : -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: pos.above ? 6 : -6, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setVisible(true)}
              onMouseLeave={() => setVisible(false)}
              style={{
                position: 'fixed',
                left:    `${pos.x}px`,
                top:     `${pos.y}px`,
                zIndex:  99999,
                width:   '258px',
              }}
            >
              <div
                style={{
                  background:   '#0F1622',
                  border:       '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  boxShadow:    '0 24px 60px rgba(0,0,0,0.78), 0 0 0 1px rgba(255,255,255,0.04)',
                  overflow:     'hidden',
                }}
              >

                {/* ── Tooltip header ── */}
                <div
                  className="flex items-center justify-between px-4 pt-3.5 pb-2.5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p
                    className="text-[9px] font-bold tracking-widest uppercase"
                    style={{ color: 'rgba(255,255,255,0.28)' }}
                  >
                    {s.title}
                  </p>
                  {/* Variant badge */}
                  <span
                    className="text-[8px] font-bold tracking-widest px-2 py-0.5 rounded-full"
                    style={isAlpha
                      ? { background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }
                      : { background: 'rgba(52,211,153,0.1)',  color: '#34D399', border: '1px solid rgba(52,211,153,0.2)' }
                    }
                  >
                    {isAlpha ? 'α ALPHA' : 'STABLE'}
                  </span>
                </div>

                {/* ── Google section ── */}
                <div className="px-4 pt-3.5 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <GoogleG />
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: 'rgba(255,255,255,0.65)' }}
                    >
                      {s.googleLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pl-[26px]">
                    <MiniStars value={data.googleRating} />
                    <span className="text-white text-xs font-bold">{data.googleRating}</span>
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
                      · {s.reviews(data.googleCount)}
                    </span>
                  </div>
                </div>

                {/* Separator */}
                <div className="mx-4" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                {/* ── Aurevia section ── */}
                <div className="px-4 pt-3.5 pb-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <AureviaA />
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: 'rgba(212,175,55,0.85)' }}
                    >
                      {s.aureviaLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3 pl-[26px]">
                    <MiniStars value={data.aureviaRating} />
                    <span className="text-white text-xs font-bold">{data.aureviaRating}</span>
                    <span
                      className="text-[8px] font-bold tracking-widest px-1.5 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(212,175,55,0.12)',
                        color:      '#D4AF37',
                        border:     '1px solid rgba(212,175,55,0.22)',
                      }}
                    >
                      {s.excl}
                    </span>
                  </div>

                  {/* Criteria bars */}
                  <div className="space-y-2 pl-1">
                    <CriterionBar emoji="💰" label={s.price}   value={data.criteria.price}   />
                    <CriterionBar emoji="🏆" label={s.quality} value={data.criteria.quality} />
                    <CriterionBar emoji="⚡" label={s.speed}   value={data.criteria.speed}   />
                  </div>
                </div>

                {/* ── Alpha-only: broker review ── */}
                {isAlpha && (
                  <>
                    <div className="mx-4" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                    <div className="px-4 pt-3 pb-4">
                      <p
                        className="text-[9px] font-bold tracking-widest uppercase mb-2.5"
                        style={{ color: 'rgba(255,255,255,0.22)' }}
                      >
                        {s.lastReview}
                      </p>
                      {/* Review card */}
                      <div
                        className="relative pl-3"
                        style={{ paddingLeft: '12px' }}
                      >
                        {/* Gold left accent */}
                        <div
                          className="absolute left-0 top-0 bottom-0 rounded-full"
                          style={{
                            width:      '2px',
                            background: 'linear-gradient(180deg, #D4AF37, rgba(212,175,55,0.15))',
                          }}
                        />
                        <p
                          className="text-[11px] leading-[1.55] mb-2"
                          style={{ color: 'rgba(255,255,255,0.5)' }}
                        >
                          "{review.text}"
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-[10px] font-semibold"
                            style={{ color: 'rgba(212,175,55,0.75)' }}
                          >
                            {review.author}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>·</span>
                          <span
                            className="text-[10px]"
                            style={{ color: 'rgba(255,255,255,0.28)' }}
                          >
                            {review.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
