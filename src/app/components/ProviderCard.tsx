import { Phone, Copy, MapPin, MessageCircle, Heart, ShieldCheck, CalendarClock, FileText, Share2, Smartphone, Mail, X, CheckCircle2, ChevronDown, ExternalLink, Send } from 'lucide-react';
import { DualRatingTooltip } from './DualRatingTooltip';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useFavorites, FavoriteProvider } from '../hooks/useFavorites';
import { useLanguage } from '../contexts/LanguageContext';
import { useVersion } from '../contexts/VersionContext';
import { AddToDossierModal } from './AddToDossierModal';
import { SchedulingModal } from './SchedulingModal';

interface Provider extends FavoriteProvider {}

interface ProviderCardProps {
  provider: Provider;
  index?: number;
  onConcierge?: (provider: Provider) => void;
}

// ── Country codes ─────────────────────────────────────────────────────────────

const COUNTRIES = [
  { flag: '🇨🇦', abbr: 'CA',  code: '+1',   name: 'Canada'       },
  { flag: '🇺🇸', abbr: 'USA', code: '+1',   name: 'États-Unis'   },
  { flag: '🇫🇷', abbr: 'FR',  code: '+33',  name: 'France'       },
  { flag: '🇧🇪', abbr: 'BE',  code: '+32',  name: 'Belgique'     },
  { flag: '🇨🇭', abbr: 'CH',  code: '+41',  name: 'Suisse'       },
  { flag: '🇲🇦', abbr: 'MA',  code: '+212', name: 'Maroc'        },
  { flag: '🇬🇧', abbr: 'UK',  code: '+44',  name: 'Royaume-Uni'  },
  { flag: '🇩🇪', abbr: 'DE',  code: '+49',  name: 'Allemagne'    },
  { flag: '🇪🇸', abbr: 'ES',  code: '+34',  name: 'Espagne'      },
  { flag: '🇵🇹', abbr: 'PT',  code: '+351', name: 'Portugal'     },
  { flag: '🇮🇹', abbr: 'IT',  code: '+39',  name: 'Italie'       },
  { flag: '🇦🇺', abbr: 'AU',  code: '+61',  name: 'Australie'    },
];

// ── Client notify modal ───────────────────────────────────────────────────────

function ClientNotifyModal({
  provider, onClose,
}: { provider: Provider; onClose: () => void }) {
  const { lang, t } = useLanguage();
  const serviceLabel = t.services[provider.category] ?? provider.category;

  const defaultMessage = lang === 'fr'
    ? `Bonjour,\n\nVotre courtier immobilier a réservé les services de ${provider.name} (${serviceLabel}) pour votre propriété.\n\nIls vous contacteront prochainement au ${provider.phone}.\n\nBonne journée !`
    : `Hello,\n\nYour real estate broker has booked ${serviceLabel} services with ${provider.name} for your property.\n\nThey will contact you soon at ${provider.phone}.\n\nHave a great day!`;

  const emailSubject = lang === 'fr'
    ? `Confirmation de réservation — ${serviceLabel}`
    : `Booking Confirmation — ${serviceLabel}`;

  const [message, setMessage]     = useState(defaultMessage);
  const [channel, setChannel]     = useState<'sms' | 'email'>('sms');

  // SMS state
  const [country, setCountry]           = useState(COUNTRIES[0]);
  const [showCountries, setShowCountries] = useState(false);
  const [phone, setPhone]               = useState('');
  const countryRef = useRef<HTMLDivElement>(null);

  // Email state
  const [email, setEmail]               = useState('');
  const [aureviaState, setAureviaState] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Close country dropdown on outside click
  useEffect(() => {
    if (!showCountries) return;
    const h = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node))
        setShowCountries(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showCountries]);

  const handleSendSMS = () => {
    if (!phone.trim()) return;
    const full = `${country.code}${phone.replace(/\D/g, '')}`;
    window.open(`sms:${full}?body=${encodeURIComponent(message)}`);
    toast.success(lang === 'fr' ? `SMS préparé pour ${full}` : `SMS ready for ${full}`);
    onClose();
  };

  const handleSendAurevia = async () => {
    if (!email.trim()) return;
    setAureviaState('sending');
    await new Promise(r => setTimeout(r, 1300));
    setAureviaState('sent');
    toast.success(lang === 'fr' ? `Email envoyé à ${email} via Aurevia` : `Email sent to ${email} via Aurevia`);
    setTimeout(onClose, 1400);
  };

  const handleSendExternal = () => {
    const to = email.trim();
    window.open(`mailto:${to}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(message)}`);
    toast.success(lang === 'fr' ? 'Application email ouverte' : 'Email app opened');
    onClose();
  };

  const s = lang === 'fr' ? {
    title:       'Notifier le client',
    subtitle:    'Envoyez une confirmation de réservation à votre client.',
    msgLabel:    'Message',
    channelSMS:  'SMS',
    channelEmail:'Email',
    phoneLabel:  'Numéro de téléphone',
    phonePH:     '514 000-0000',
    emailLabel:  'Adresse email',
    emailPH:     'client@exemple.com',
    sendSMS:     'Envoyer le SMS',
    sendAurevia: 'Envoyer via Aurevia',
    sendExt:     'Ouvrir application externe',
    sending:     'Envoi en cours…',
    sent:        'Email envoyé !',
    cancel:      'Annuler',
    countryLabel:'Pays',
    phoneMissing:'Entrez un numéro de téléphone',
    emailMissing:'Entrez une adresse email',
  } : {
    title:       'Notify client',
    subtitle:    'Send a booking confirmation to your client.',
    msgLabel:    'Message',
    channelSMS:  'SMS',
    channelEmail:'Email',
    phoneLabel:  'Phone number',
    phonePH:     '514 000-0000',
    emailLabel:  'Email address',
    emailPH:     'client@example.com',
    sendSMS:     'Send SMS',
    sendAurevia: 'Send via Aurevia',
    sendExt:     'Open external app',
    sending:     'Sending…',
    sent:        'Email sent!',
    cancel:      'Cancel',
    countryLabel:'Country',
    phoneMissing:'Enter a phone number',
    emailMissing:'Enter an email address',
  };

  const fieldStyle = {
    background: 'rgba(255,255,255,0.04)',
    border:     '1px solid rgba(255,255,255,0.1)',
    color:      'rgba(255,255,255,0.85)',
    caretColor: '#D4AF37',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 flex items-center justify-center z-[1200] px-5"
      style={{ background: 'rgba(3,8,18,0.78)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full rounded-3xl overflow-hidden"
        style={{
          maxWidth: '460px',
          maxHeight: '92vh',
          background: 'rgba(8,16,32,0.99)',
          border:     '1px solid rgba(255,255,255,0.09)',
          boxShadow:  '0 40px 80px rgba(0,0,0,0.72)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Scrollable body */}
        <div className="overflow-y-auto p-7" style={{ maxHeight: '92vh' }}>

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-5 right-5 transition-colors"
            style={{ color: 'rgba(255,255,255,0.25)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>
            <X className="size-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="size-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.22)' }}>
              <Send className="size-4" style={{ color: '#D4AF37' }} />
            </div>
            <div>
              <h3 className="text-white text-base font-semibold leading-tight">{s.title}</h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{s.subtitle}</p>
            </div>
          </div>

          {/* Provider chip */}
          <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <ShieldCheck className="size-3.5 shrink-0" style={{ color: '#D4AF37' }} />
            <span className="text-sm text-white/80 truncate font-medium">{provider.name}</span>
            <span className="text-xs ml-auto shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {serviceLabel}
            </span>
          </div>

          {/* Message */}
          <div className="mb-5">
            <label className="block text-[10px] font-bold tracking-widest uppercase mb-2"
              style={{ color: 'rgba(255,255,255,0.32)' }}>{s.msgLabel}</label>
            <textarea rows={5} value={message} onChange={e => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm bg-transparent resize-none outline-none leading-relaxed"
              style={fieldStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.4)')}
              onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
          </div>

          {/* Channel toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl mb-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {(['sms', 'email'] as const).map(ch => {
              const active = channel === ch;
              const Icon   = ch === 'sms' ? Smartphone : Mail;
              const label  = ch === 'sms' ? s.channelSMS : s.channelEmail;
              return (
                <motion.button key={ch} layout onClick={() => setChannel(ch)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold relative"
                  style={{ color: active ? 'white' : 'rgba(255,255,255,0.38)' }}>
                  {active && (
                    <motion.div layoutId="channel-pill" className="absolute inset-0 rounded-lg"
                      style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                  )}
                  <Icon className="size-3.5 relative z-10" />
                  <span className="relative z-10">{label}</span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">

            {/* ── SMS ── */}
            {channel === 'sms' && (
              <motion.div key="sms"
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.18 }}
                className="space-y-4">

                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase mb-2"
                    style={{ color: 'rgba(255,255,255,0.32)' }}>{s.phoneLabel}</label>

                  <div className="flex gap-2">
                    {/* Country selector */}
                    <div ref={countryRef} className="relative shrink-0">
                      <button
                        onClick={() => setShowCountries(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-3 rounded-xl text-sm transition-all h-full"
                        style={{
                          ...fieldStyle,
                          minWidth: '110px',
                          border: showCountries ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.1)',
                        }}>
                        <span className="font-semibold tracking-wide text-xs" style={{ color: 'rgba(255,255,255,0.85)' }}>
                          {country.abbr}
                        </span>
                        <span className="font-medium text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                          {country.code}
                        </span>
                        <ChevronDown className={`size-3 transition-transform ml-auto shrink-0 ${showCountries ? 'rotate-180' : ''}`}
                          style={{ color: 'rgba(255,255,255,0.35)' }} />
                      </button>

                      <AnimatePresence>
                        {showCountries && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            transition={{ duration: 0.16 }}
                            className="absolute top-full left-0 mt-1.5 rounded-xl overflow-hidden z-20"
                            style={{
                              minWidth: '200px',
                              background: 'rgba(10,20,40,0.99)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                            }}>
                            {COUNTRIES.map((c, i) => {
                              const isSelected = c.abbr === country.abbr && c.name === country.name;
                              return (
                                <button key={i} onClick={() => { setCountry(c); setShowCountries(false); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all"
                                  style={{
                                    background:   isSelected ? 'rgba(212,175,55,0.08)' : 'transparent',
                                    borderBottom: i < COUNTRIES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                  }}
                                  onMouseEnter={e => { if (!isSelected) (e.currentTarget.style.background = 'rgba(255,255,255,0.05)'); }}
                                  onMouseLeave={e => { (e.currentTarget.style.background = isSelected ? 'rgba(212,175,55,0.08)' : 'transparent'); }}>
                                  <span className="text-sm flex-1 leading-tight" style={{ color: 'rgba(255,255,255,0.78)' }}>
                                    {c.name}
                                  </span>
                                  {/* Abbr + code badge */}
                                  <span
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums"
                                    style={{
                                      background: isSelected ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.07)',
                                      color:      isSelected ? '#D4AF37' : 'rgba(255,255,255,0.38)',
                                      letterSpacing: '0.04em',
                                    }}>
                                    {c.abbr} {c.code}
                                  </span>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Phone number */}
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder={s.phonePH}
                      className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                      style={fieldStyle}
                      onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.4)')}
                      onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                  </div>
                </div>

                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSendSMS}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: phone.trim() ? 'linear-gradient(135deg,#0A1628,#1a2842)' : 'rgba(255,255,255,0.06)',
                    color:      phone.trim() ? 'white' : 'rgba(255,255,255,0.3)',
                    boxShadow:  phone.trim() ? '0 4px 16px rgba(10,22,40,0.3)' : 'none',
                  }}>
                  <Smartphone className="size-4" />
                  {s.sendSMS}
                  {phone.trim() && (
                    <span className="ml-1 opacity-60 text-xs font-normal">
                      {country.code} {phone}
                    </span>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* ── Email ── */}
            {channel === 'email' && (
              <motion.div key="email"
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}
                className="space-y-3">

                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase mb-2"
                    style={{ color: 'rgba(255,255,255,0.32)' }}>{s.emailLabel}</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder={s.emailPH}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={fieldStyle}
                    onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.4)')}
                    onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                </div>

                {/* Send via Aurevia */}
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSendAurevia}
                  disabled={aureviaState !== 'idle'}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: aureviaState === 'sent'
                      ? 'rgba(52,211,153,0.15)'
                      : email.trim() ? 'linear-gradient(135deg,#D4AF37,#B8962F)' : 'rgba(212,175,55,0.1)',
                    color: aureviaState === 'sent'
                      ? '#34D399'
                      : email.trim() ? '#07111f' : 'rgba(212,175,55,0.35)',
                    boxShadow: email.trim() && aureviaState === 'idle' ? '0 4px 20px rgba(212,175,55,0.25)' : 'none',
                  }}>
                  {aureviaState === 'sending' ? (
                    <>
                      <div className="size-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      {s.sending}
                    </>
                  ) : aureviaState === 'sent' ? (
                    <>
                      <CheckCircle2 className="size-4" />
                      {s.sent}
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      {s.sendAurevia}
                    </>
                  )}
                </motion.button>

                {/* Separator */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  <span className="text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.2)' }}>ou</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                </div>

                {/* External app */}
                <button onClick={handleSendExternal}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}>
                  <ExternalLink className="size-3.5" />
                  {s.sendExt}
                  <span className="text-[10px] ml-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    Outlook, Gmail…
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button onClick={onClose}
            className="w-full py-2 mt-4 rounded-xl text-xs transition-colors"
            style={{ color: 'rgba(255,255,255,0.22)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.22)')}>
            {s.cancel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Provider card ─────────────────────────────────────────────────────────────

export function ProviderCard({ provider, index, onConcierge }: ProviderCardProps) {
  const [copied, setCopied]                     = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showScheduling, setShowScheduling]     = useState(false);
  const [showClientNotify, setShowClientNotify] = useState(false);
  const { toggle, isSaved } = useFavorites();
  const { t, lang }  = useLanguage();
  const { isAlpha }  = useVersion();
  const saved = isSaved(provider.id);

  const handleSave = () => {
    toggle(provider);
    toast.success(saved ? t.removedFromFav(provider.name) : t.addedToFav(provider.name));
  };

  const handleCopyContact = () => {
    navigator.clipboard.writeText(`${provider.name}\n${provider.phone}\n${provider.address}`);
    setCopied(true);
    toast.success(t.contactCopied);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className={`bg-white rounded-xl border transition-all p-6 hover:shadow-lg ${saved ? 'border-[#D4AF37]/40' : 'border-[#E5E7EB]'}`}>

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          {index !== undefined && (
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="size-8 rounded-full bg-[#0A1628] flex items-center justify-center">
                <span className="text-xs font-bold text-[#D4AF37]">{index}</span>
              </div>
              <motion.button onClick={handleSave} whileTap={{ scale: 0.75 }}>
                <motion.div animate={saved ? { scale: [1, 1.4, 1] } : { scale: 1 }} transition={{ duration: 0.25 }}>
                  <Heart className="size-4 transition-colors"
                    style={{ fill: saved ? '#e11d48' : 'transparent', color: saved ? '#e11d48' : '#0A1628', opacity: saved ? 1 : 0.3 }} />
                </motion.div>
              </motion.button>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-[#0A1628] leading-tight mb-1">{provider.name}</h3>
            <div className="flex items-center gap-3 text-sm text-[#0A1628]/60">
              <DualRatingTooltip provider={provider} />
              <div className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                <span>{provider.distance} km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category + Vérifié */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-block px-3 py-1 bg-[#0A1628]/5 text-[#0A1628] text-xs rounded-full">
            {t.services[provider.category] ?? provider.category}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-medium tracking-wide" style={{ color: '#B8960C' }}>
            <ShieldCheck className="size-3" style={{ color: '#B8960C' }} />
            {t.verifiedBy}
          </span>
        </div>

        {/* Contact */}
        <div className="mb-4 space-y-2">
          {provider.phone && (
            <p className="text-sm text-[#0A1628]/70 flex items-center gap-2">
              <Phone className="size-3.5 shrink-0" />
              {provider.phone}
            </p>
          )}
          <p className="text-sm text-[#0A1628]/60 flex items-start gap-2">
            <MapPin className="size-3.5 mt-0.5 shrink-0" />
            <span className="leading-snug">{provider.address}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {/* Row 1: Copy / Call / Schedule */}
          <div className="grid grid-cols-3 gap-2">
            <button onClick={handleCopyContact}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors text-sm text-[#0A1628]">
              <Copy className="size-3.5" />
              {copied ? t.copied : t.copy}
            </button>

            <button onClick={() => { window.location.href = `tel:${provider.phone}`; }}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors text-sm text-[#0A1628]">
              <Phone className="size-3.5" />
              {t.call}
            </button>

            {/* Planifier */}
            {isAlpha ? (
              <button onClick={() => setShowScheduling(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ border: '1px solid rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.06)', color: '#B8960C' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.6)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.4)'; }}>
                <CalendarClock className="size-3.5" />
                {t.schedule}
              </button>
            ) : (
              <div className="relative group">
                <button disabled
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm cursor-not-allowed select-none"
                  style={{ border: '1px dashed #D1D5DB', background: '#FAFAFA', color: '#9CA3AF', opacity: 0.85 }}>
                  <CalendarClock className="size-3.5" />
                  {t.schedule}
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:flex z-50 pointer-events-none">
                  <div className="rounded-lg px-3 py-2 text-xs text-white leading-snug text-center shadow-xl"
                    style={{ background: '#0A1628', maxWidth: '200px', whiteSpace: 'normal' }}>
                    {t.scheduleTooltip}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full"
                      style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #0A1628' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Row 2: Exporter Fiche + Share | Concierge */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex gap-1.5">
              {/* Exporter Fiche → Add to Dossier */}
              <button onClick={() => setShowDossierModal(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all text-sm"
                style={{ border: '1px solid rgba(212,175,55,0.3)', color: '#B8960C', background: 'rgba(212,175,55,0.04)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.55)'; (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.09)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.04)'; }}>
                <FileText className="size-3.5 shrink-0" />
                <span className="truncate">{t.exportSheet}</span>
              </button>

              {/* Notify client */}
              <button
                onClick={() => setShowClientNotify(true)}
                title={lang === 'fr' ? 'Notifier le client' : 'Notify client'}
                className="size-[38px] flex items-center justify-center rounded-lg transition-all shrink-0"
                style={{ border: '1px solid rgba(212,175,55,0.3)', color: 'rgba(184,150,12,0.65)', background: 'rgba(212,175,55,0.04)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.55)'; (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.09)'; (e.currentTarget as HTMLElement).style.color = '#B8960C'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(184,150,12,0.65)'; }}>
                <Share2 className="size-3.5" />
              </button>
            </div>

            {/* Concierge */}
            <button
              onClick={() => onConcierge ? onConcierge(provider) : toast.success(t.conciergeContact)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A1628] text-white rounded-lg hover:bg-[#1a2842] active:scale-95 transition-all text-sm">
              <MessageCircle className="size-4" />
              {t.concierge}
            </button>
          </div>
        </div>

        {/* Alpha badge */}
        {isAlpha && (
          <div className="mt-3 pt-3 flex items-center gap-1.5" style={{ borderTop: '1px solid #F3F4F6' }}>
            <div className="size-1.5 rounded-full" style={{ background: '#D4AF37' }} />
            <span className="text-[9px] font-bold tracking-widest" style={{ color: 'rgba(184,150,12,0.6)' }}>
              α ALPHA · RÉSERVATION ACTIVÉE
            </span>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showDossierModal && (
          <AddToDossierModal providerName={provider.name} onClose={() => setShowDossierModal(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScheduling && (
          <SchedulingModal
            provider={{ id: provider.id, name: provider.name, category: provider.category, phone: provider.phone }}
            onClose={() => setShowScheduling(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClientNotify && (
          <ClientNotifyModal provider={provider} onClose={() => setShowClientNotify(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
