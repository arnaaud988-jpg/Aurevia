import { useState } from 'react';
import { X, Check, ChevronRight, ChevronLeft, Home, Settings, FileText, ClipboardCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

// ── Types ─────────────────────────────────────────────────────────────────────

type PropertyType = 'maison' | 'condo' | 'plex' | 'commercial' | 'terrain';

interface Step1Data {
  propertyType: PropertyType | '';
  surface:      string;
  yearBuilt:    string;
  rooms:        string;
  parking:      string;
}

interface Step2Data {
  drone:          boolean;
  virtual360:     boolean;
  twilightShot:   boolean;
  floorPlan:      boolean;
  videoWalkthrough: boolean;
  retouching:     boolean;
}

interface Step3Data {
  highlights:       string;
  accessCode:       string;
  accessInstructions: string;
  presenceRequired: boolean;
  contactOnSite:    string;
}

const STEP_ICONS = [
  <Home className="size-4" />,
  <Settings className="size-4" />,
  <FileText className="size-4" />,
  <ClipboardCheck className="size-4" />,
];

const PROPERTY_TYPES: { key: PropertyType; fr: string; en: string; emoji: string }[] = [
  { key: 'maison',      fr: 'Maison unifamiliale', en: 'Single-family home', emoji: '🏠' },
  { key: 'condo',       fr: 'Condo / Appartement', en: 'Condo / Apartment',   emoji: '🏢' },
  { key: 'plex',        fr: 'Plex / Multilogement', en: 'Plex / Multi-unit',  emoji: '🏘️' },
  { key: 'commercial',  fr: 'Commercial',            en: 'Commercial',          emoji: '🏪' },
  { key: 'terrain',     fr: 'Terrain',               en: 'Land',                emoji: '🌿' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function ToggleOption({
  label, sublabel, value, onChange,
}: { label: string; sublabel?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-4 rounded-xl cursor-pointer transition-all"
      style={{
        background: value ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.03)',
        border:     `1px solid ${value ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.08)'}`,
      }}
      onClick={() => onChange(!value)}
    >
      <div>
        <p className="text-white text-sm font-medium leading-tight">{label}</p>
        {sublabel && <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{sublabel}</p>}
      </div>
      <div
        className="relative size-12 h-6 rounded-full transition-colors shrink-0"
        style={{ background: value ? '#D4AF37' : 'rgba(255,255,255,0.12)', width: '44px' }}
      >
        <motion.div
          animate={{ x: value ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="absolute top-1 size-4 rounded-full bg-white shadow"
        />
      </div>
    </div>
  );
}

function TextArea({
  label, placeholder, value, onChange, rows = 3,
}: { label: string; placeholder: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-[10px] font-bold tracking-widest uppercase mb-2"
        style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-white text-sm bg-transparent resize-none outline-none leading-relaxed"
        style={{
          background:  'rgba(255,255,255,0.04)',
          border:      '1px solid rgba(255,255,255,0.1)',
          caretColor:  '#D4AF37',
          color:       'white',
        }}
        onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.4)')}
        onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
      />
    </div>
  );
}

function InputField({
  label, placeholder, value, onChange, type = 'text',
}: { label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-[10px] font-bold tracking-widest uppercase mb-2"
        style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-white text-sm bg-transparent outline-none"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border:     '1px solid rgba(255,255,255,0.1)',
          caretColor: '#D4AF37',
        }}
        onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.4)')}
        onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function BriefingFormModal({
  providerName, service, onClose, onConfirm,
}: {
  providerName: string;
  service:      string;
  onClose:      () => void;
  onConfirm:    () => void;
}) {
  const { lang } = useLanguage();
  const [step, setStep]     = useState(0);
  const [dir, setDir]       = useState<1 | -1>(1);
  const [step1, setStep1]   = useState<Step1Data>({ propertyType: '', surface: '', yearBuilt: '', rooms: '', parking: '' });
  const [step2, setStep2]   = useState<Step2Data>({ drone: false, virtual360: false, twilightShot: false, floorPlan: false, videoWalkthrough: false, retouching: false });
  const [step3, setStep3]   = useState<Step3Data>({ highlights: '', accessCode: '', accessInstructions: '', presenceRequired: false, contactOnSite: '' });

  const goTo = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const s = lang === 'fr' ? {
    title:    'Briefing de réservation',
    subtitle: (n: string) => `Pour ${n}`,
    steps:    ['Propriété', 'Options', 'Accès & Notes', 'Confirmation'],
    // Step 1
    propTypeLabel:  'Type de bien',
    surfaceLabel:   'Superficie (pi²)',
    surfaceHolder:  'Ex : 1 800',
    yearLabel:      'Année de construction',
    yearHolder:     'Ex : 2005',
    roomsLabel:     'Nombre de pièces',
    roomsHolder:    'Ex : 6',
    parkingLabel:   'Stationnement',
    parkingHolder:  'Ex : Garage double',
    // Step 2
    optionsTitle:   'Options du service',
    optionsDrone:   'Option Drone',
    optionsDroneSub:'Prise de vue aérienne extérieure',
    optionsVR:      'Visite virtuelle 360°',
    optionsVRSub:   'Intégration Matterport ou équivalent',
    optionsTwi:     'Photos crépuscule',
    optionsTwiSub:  'Séance au coucher du soleil',
    optionsFloor:   "Plan d'étage inclus",
    optionsFloorSub:'Dessin vectoriel des pièces',
    optionsVideo:   'Vidéo-visite commentée',
    optionsVideoSub:'Narration professionnelle incluse',
    optionsRet:     'Retouche photo avancée',
    optionsRetSub:  'Correction HDR + rendu premium',
    // Step 3
    highlightsLabel:  'Points forts à valoriser',
    highlightsHolder: 'Ex : Grande fenestration, cuisine rénovée en 2023, piscine chauffée…',
    accessCodeLabel:  'Code boîte à clé / accès',
    accessCodeHolder: 'Ex : Code : 2026 · Boîte verte côté garage',
    accessInsLabel:   "Instructions d'accès complémentaires",
    accessInsHolder:  "Ex : Sonnez deux fois, chien dans la cour — laisser la barrière fermée.",
    presenceLabel:    'Je serai présent(e) lors de la visite',
    contactLabel:     'Contact sur place (si différent)',
    contactHolder:    'Ex : Marie Tremblay · (514) 555-0123',
    // Step 4
    summaryTitle: 'Résumé du briefing',
    propSection:  'Propriété',
    optSection:   'Options sélectionnées',
    notesSection: "Notes d'accès",
    noOptions:    'Aucune option sélectionnée',
    noNotes:      'Aucune note renseignée',
    // Nav
    next:         'Suivant',
    prev:         'Précédent',
    confirm:      'Confirmer la réservation',
    cancel:       'Annuler',
  } : {
    title:    'Booking Brief',
    subtitle: (n: string) => `For ${n}`,
    steps:    ['Property', 'Options', 'Access & Notes', 'Confirm'],
    propTypeLabel:  'Property type',
    surfaceLabel:   'Surface area (sq ft)',
    surfaceHolder:  'Ex: 1,800',
    yearLabel:      'Year built',
    yearHolder:     'Ex: 2005',
    roomsLabel:     'Number of rooms',
    roomsHolder:    'Ex: 6',
    parkingLabel:   'Parking',
    parkingHolder:  'Ex: Double garage',
    optionsTitle:   'Service options',
    optionsDrone:   'Drone Option',
    optionsDroneSub:'Aerial exterior shots',
    optionsVR:      '360° Virtual Tour',
    optionsVRSub:   'Matterport or equivalent integration',
    optionsTwi:     'Twilight Photography',
    optionsTwiSub:  'Sunset session',
    optionsFloor:   'Floor plan included',
    optionsFloorSub:'Vector room drawing',
    optionsVideo:   'Narrated video walkthrough',
    optionsVideoSub:'Professional narration included',
    optionsRet:     'Advanced photo retouching',
    optionsRetSub:  'HDR correction + premium render',
    highlightsLabel:  'Key highlights to emphasize',
    highlightsHolder: 'Ex: Large windows, kitchen renovated in 2023, heated pool…',
    accessCodeLabel:  'Key box / access code',
    accessCodeHolder: 'Ex: Code: 2026 · Green box, garage side',
    accessInsLabel:   'Additional access instructions',
    accessInsHolder:  'Ex: Ring twice, dog in the yard — keep gate closed.',
    presenceLabel:    'I will be present during the visit',
    contactLabel:     'On-site contact (if different)',
    contactHolder:    'Ex: Marie Tremblay · (514) 555-0123',
    summaryTitle: 'Briefing summary',
    propSection:  'Property',
    optSection:   'Selected options',
    notesSection: 'Access notes',
    noOptions:    'No options selected',
    noNotes:      'No notes provided',
    next:         'Next',
    prev:         'Previous',
    confirm:      'Confirm booking',
    cancel:       'Cancel',
  };

  const step2Options = [
    { key: 'drone',           label: s.optionsDrone,   sub: s.optionsDroneSub   },
    { key: 'virtual360',      label: s.optionsVR,      sub: s.optionsVRSub      },
    { key: 'twilightShot',    label: s.optionsTwi,     sub: s.optionsTwiSub     },
    { key: 'floorPlan',       label: s.optionsFloor,   sub: s.optionsFloorSub   },
    { key: 'videoWalkthrough',label: s.optionsVideo,   sub: s.optionsVideoSub   },
    { key: 'retouching',      label: s.optionsRet,     sub: s.optionsRetSub     },
  ] as const;

  const selectedOptions = step2Options.filter(o => step2[o.key]);

  const handleConfirm = () => {
    onConfirm();
    toast.success(lang === 'fr' ? 'Réservation confirmée avec briefing' : 'Booking confirmed with brief');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 flex items-center justify-center z-[1300] px-4"
      style={{ background: 'rgba(3,8,18,0.82)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full rounded-3xl overflow-hidden flex flex-col"
        style={{
          maxWidth:   '580px',
          maxHeight:  '90vh',
          background: '#0A1220',
          border:     '1px solid rgba(255,255,255,0.09)',
          boxShadow:  '0 48px 96px rgba(0,0,0,0.78)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-7 pt-7 pb-5 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-white text-lg font-semibold leading-tight">{s.title}</h2>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {s.subtitle(providerName)} · {service}
              </p>
            </div>
            <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors mt-1">
              <X className="size-4" />
            </button>
          </div>

          {/* Step progress */}
          <div className="flex items-center gap-0">
            {s.steps.map((label, i) => {
              const done    = i < step;
              const current = i === step;
              return (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  {/* Step circle */}
                  <button
                    onClick={() => i <= step && goTo(i)}
                    className="flex flex-col items-center gap-1.5 group"
                    style={{ cursor: i <= step ? 'pointer' : 'default' }}
                  >
                    <motion.div
                      animate={{
                        background: done ? '#D4AF37' : current ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.06)',
                        border: current ? '2px solid #D4AF37' : done ? '2px solid #D4AF37' : '2px solid rgba(255,255,255,0.12)',
                      }}
                      transition={{ duration: 0.25 }}
                      className="size-8 rounded-full flex items-center justify-center"
                    >
                      {done ? (
                        <Check className="size-3.5" style={{ color: '#07111f' }} />
                      ) : (
                        <span style={{ color: current ? '#D4AF37' : 'rgba(255,255,255,0.3)' }}>
                          {STEP_ICONS[i]}
                        </span>
                      )}
                    </motion.div>
                    <span className="text-[9px] font-semibold tracking-wide whitespace-nowrap hidden sm:block"
                      style={{ color: current ? '#D4AF37' : done ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.25)' }}>
                      {label}
                    </span>
                  </button>
                  {/* Connector */}
                  {i < s.steps.length - 1 && (
                    <div className="flex-1 h-px mx-2 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <motion.div
                        animate={{ width: done ? '100%' : '0%' }}
                        transition={{ duration: 0.4 }}
                        className="h-full rounded-full"
                        style={{ background: '#D4AF37' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Step content ── */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -30 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="px-7 py-6 space-y-5"
            >

              {/* STEP 0 — Propriété */}
              {step === 0 && (
                <>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-3"
                      style={{ color: 'rgba(255,255,255,0.32)' }}>
                      {s.propTypeLabel}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {PROPERTY_TYPES.map(pt => {
                        const active = step1.propertyType === pt.key;
                        return (
                          <button
                            key={pt.key}
                            onClick={() => setStep1(p => ({ ...p, propertyType: pt.key }))}
                            className="flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl text-xs font-medium transition-all"
                            style={{
                              background: active ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)',
                              border:     `1px solid ${active ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.07)'}`,
                              color:      active ? '#D4AF37' : 'rgba(255,255,255,0.5)',
                            }}
                          >
                            <span className="text-xl">{pt.emoji}</span>
                            <span className="text-[11px] text-center leading-tight">{lang === 'fr' ? pt.fr : pt.en}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label={s.surfaceLabel}  placeholder={s.surfaceHolder}  value={step1.surface}   onChange={v => setStep1(p => ({ ...p, surface: v }))}   type="number" />
                    <InputField label={s.yearLabel}     placeholder={s.yearHolder}     value={step1.yearBuilt} onChange={v => setStep1(p => ({ ...p, yearBuilt: v }))} type="number" />
                    <InputField label={s.roomsLabel}    placeholder={s.roomsHolder}    value={step1.rooms}     onChange={v => setStep1(p => ({ ...p, rooms: v }))}     type="number" />
                    <InputField label={s.parkingLabel}  placeholder={s.parkingHolder}  value={step1.parking}   onChange={v => setStep1(p => ({ ...p, parking: v }))} />
                  </div>
                </>
              )}

              {/* STEP 1 — Options */}
              {step === 1 && (
                <div className="space-y-2.5">
                  {step2Options.map(opt => (
                    <ToggleOption
                      key={opt.key}
                      label={opt.label}
                      sublabel={opt.sub}
                      value={step2[opt.key]}
                      onChange={v => setStep2(p => ({ ...p, [opt.key]: v }))}
                    />
                  ))}
                </div>
              )}

              {/* STEP 2 — Accès & Notes */}
              {step === 2 && (
                <>
                  <TextArea
                    label={s.highlightsLabel}
                    placeholder={s.highlightsHolder}
                    value={step3.highlights}
                    onChange={v => setStep3(p => ({ ...p, highlights: v }))}
                    rows={3}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label={s.accessCodeLabel}
                      placeholder={s.accessCodeHolder}
                      value={step3.accessCode}
                      onChange={v => setStep3(p => ({ ...p, accessCode: v }))}
                    />
                    <InputField
                      label={s.contactLabel}
                      placeholder={s.contactHolder}
                      value={step3.contactOnSite}
                      onChange={v => setStep3(p => ({ ...p, contactOnSite: v }))}
                    />
                  </div>
                  <TextArea
                    label={s.accessInsLabel}
                    placeholder={s.accessInsHolder}
                    value={step3.accessInstructions}
                    onChange={v => setStep3(p => ({ ...p, accessInstructions: v }))}
                    rows={2}
                  />
                  <ToggleOption
                    label={s.presenceLabel}
                    value={step3.presenceRequired}
                    onChange={v => setStep3(p => ({ ...p, presenceRequired: v }))}
                  />
                </>
              )}

              {/* STEP 3 — Résumé */}
              {step === 3 && (
                <div className="space-y-4">
                  {/* Property */}
                  <SummarySection title={s.propSection}>
                    {step1.propertyType && (
                      <SummaryRow label={s.propTypeLabel}
                        value={PROPERTY_TYPES.find(p => p.key === step1.propertyType)?.[lang === 'fr' ? 'fr' : 'en'] ?? ''} />
                    )}
                    {step1.surface   && <SummaryRow label={s.surfaceLabel} value={`${step1.surface} pi²`} />}
                    {step1.yearBuilt && <SummaryRow label={s.yearLabel}    value={step1.yearBuilt} />}
                    {step1.rooms     && <SummaryRow label={s.roomsLabel}   value={step1.rooms} />}
                    {step1.parking   && <SummaryRow label={s.parkingLabel} value={step1.parking} />}
                  </SummarySection>

                  {/* Options */}
                  <SummarySection title={s.optSection}>
                    {selectedOptions.length === 0 ? (
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>{s.noOptions}</p>
                    ) : selectedOptions.map(o => (
                      <div key={o.key} className="flex items-center gap-2">
                        <Check className="size-3.5 shrink-0" style={{ color: '#34D399' }} />
                        <span className="text-sm text-white/75">{o.label}</span>
                      </div>
                    ))}
                  </SummarySection>

                  {/* Notes */}
                  <SummarySection title={s.notesSection}>
                    {!step3.highlights && !step3.accessCode && !step3.accessInstructions ? (
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>{s.noNotes}</p>
                    ) : (
                      <>
                        {step3.highlights     && <SummaryRow label={s.highlightsLabel} value={step3.highlights} />}
                        {step3.accessCode     && <SummaryRow label={s.accessCodeLabel} value={step3.accessCode} />}
                        {step3.accessInstructions && <SummaryRow label={s.accessInsLabel} value={step3.accessInstructions} />}
                        {step3.presenceRequired && <SummaryRow label={s.presenceLabel} value="✓" />}
                        {step3.contactOnSite  && <SummaryRow label={s.contactLabel}   value={step3.contactOnSite} />}
                      </>
                    )}
                  </SummarySection>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer nav ── */}
        <div className="px-7 py-5 flex items-center gap-3 shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {step > 0 ? (
            <button
              onClick={() => goTo(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm transition-all"
              style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
            >
              <ChevronLeft className="size-4" />
              {s.prev}
            </button>
          ) : (
            <button onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm transition-colors"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >
              {s.cancel}
            </button>
          )}

          <div className="flex-1" />

          {step < 3 ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => goTo(step + 1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, #0A1628, #1a2842)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(10,22,40,0.3)',
              }}
            >
              {s.next}
              <ChevronRight className="size-4" />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleConfirm}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #B8962F)',
                color: '#07111f',
                boxShadow: '0 4px 20px rgba(212,175,55,0.3)',
              }}
            >
              <Check className="size-4" strokeWidth={3} />
              {s.confirm}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Summary helpers ───────────────────────────────────────────────────────────

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(212,175,55,0.7)' }}>{title}</p>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 justify-between">
      <span className="text-[11px] shrink-0 pt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{label}</span>
      <span className="text-sm text-white/75 text-right leading-snug">{value}</span>
    </div>
  );
}
