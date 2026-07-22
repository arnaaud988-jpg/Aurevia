import { useState } from 'react';
import { ArrowLeft, CreditCard, Lock, ShieldCheck, CheckCircle2, ChevronRight, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import logoImage from '../../imports/2f8e629f-4ee0-4e11-8d04-458f66b26676.png';

// ── Mock cart data ─────────────────────────────────────────────────────────────

interface CartItem {
  id: string;
  provider: string;
  service: string;
  serviceKey: string;
  duration: string;
  unitRate: number;
  total: number;
  date: string;
  address: string;
}

const MOCK_CART: CartItem[] = [
  {
    id: 'ci1',
    provider:   'Lumière & Propriété Photographie',
    service:    'Photographie Professionnelle',
    serviceKey: 'photo',
    duration:   '3 heures',
    unitRate:   125,
    total:      375,
    date:       '19 juil. 2024 · 10:30',
    address:    '700, rue des Éclaircies, Montréal',
  },
  {
    id: 'ci2',
    provider:   'Staging Prestige Montréal',
    service:    'Home Staging',
    serviceKey: 'home-staging',
    duration:   '1 jour',
    unitRate:   650,
    total:      650,
    date:       '22 juil. 2024 · 9:00',
    address:    '700, rue des Éclaircies, Montréal',
  },
  {
    id: 'ci3',
    provider:   'Inspection Bâtiment Pro Québec',
    service:    'Inspection de Bâtiment',
    serviceKey: 'inspection',
    duration:   '2 heures',
    unitRate:   110,
    total:      220,
    date:       '20 juil. 2024 · 14:00',
    address:    '700, rue des Éclaircies, Montréal',
  },
];

const SERVICE_EMOJI: Record<string, string> = {
  photo:         '📷',
  'home-staging': '🏠',
  inspection:    '🔍',
  evaluation:    '📋',
  notaire:       '⚖️',
  design:        '🎨',
};

const TPS  = 0.05;
const TVQ  = 0.09975;

type PayPhase = 'idle' | 'processing' | 'done';

// ── Components ────────────────────────────────────────────────────────────────

function AmountRow({ label, value, bold, highlight }: {
  label: string; value: string; bold?: boolean; highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-2 ${bold ? 'pt-3 mt-1 border-t border-gray-100' : ''}`}>
      <span className={`text-sm ${bold ? 'font-semibold text-[#0A1628]' : 'text-[#0A1628]/60'}`}>{label}</span>
      <span className={`text-sm tabular-nums ${bold ? 'font-bold text-[#0A1628] text-base' : 'text-[#0A1628]/70'} ${highlight ? 'text-[#D4AF37]' : ''}`}>
        {value}
      </span>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function CheckoutScreen({ onBack }: { onBack: () => void }) {
  const { lang } = useLanguage();
  const [cart]          = useState<CartItem[]>(MOCK_CART);
  const [payPhase, setPayPhase] = useState<PayPhase>('idle');
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const visibleCart = cart.filter(i => !removedIds.includes(i.id));
  const subtotal    = visibleCart.reduce((s, i) => s + i.total, 0);
  const tps         = subtotal * TPS;
  const tvq         = subtotal * TVQ;
  const grandTotal  = subtotal + tps + tvq;

  const fmt = (n: number) =>
    n.toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handlePay = () => {
    setPayPhase('processing');
    setTimeout(() => setPayPhase('done'), 2200);
  };

  const s = lang === 'fr' ? {
    back:        'Retour',
    title:       'Facturation & Paiement',
    subtitle:    'Récapitulatif de votre commande',
    orderTitle:  'Récapitulatif de commande',
    provider:    'Prestataire',
    service:     'Service',
    duration:    'Durée',
    rate:        'Tarif',
    total:       'Total',
    dateAddr:    'Date & Adresse',
    remove:      'Retirer',
    subtotal:    'Sous-total',
    tps:         'TPS (5 %)',
    tvq:         'TVQ (9,975 %)',
    grandTotal:  'Total à payer',
    payTitle:    'Paiement sécurisé',
    savedCard:   'Carte enregistrée',
    payBtn:      (n: string) => `Payer ${n} $`,
    processing:  'Traitement en cours…',
    doneTitle:   'Paiement confirmé !',
    doneMsg:     'Vos réservations sont confirmées. Une facture vous sera envoyée par courriel.',
    doneClose:   'Retour au tableau de bord',
    security:    'Paiement chiffré SSL · Traité par Stripe',
    emptyCart:   'Panier vide',
  } : {
    back:        'Back',
    title:       'Billing & Payment',
    subtitle:    'Order summary',
    orderTitle:  'Order summary',
    provider:    'Provider',
    service:     'Service',
    duration:    'Duration',
    rate:        'Rate',
    total:       'Total',
    dateAddr:    'Date & Address',
    remove:      'Remove',
    subtotal:    'Subtotal',
    tps:         'GST (5%)',
    tvq:         'QST (9.975%)',
    grandTotal:  'Total due',
    payTitle:    'Secure payment',
    savedCard:   'Saved card',
    payBtn:      (n: string) => `Pay ${n} $`,
    processing:  'Processing…',
    doneTitle:   'Payment confirmed!',
    doneMsg:     'Your bookings are confirmed. An invoice will be sent to your email.',
    doneClose:   'Back to dashboard',
    security:    'SSL encrypted · Processed by Stripe',
    emptyCart:   'Empty cart',
  };

  return (
    <div className="size-full flex flex-col bg-[#F1F5F9]">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 shrink-0">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <button onClick={onBack}
            className="flex items-center gap-2 text-[#0A1628]/50 hover:text-[#0A1628] transition-colors text-sm">
            <ArrowLeft className="size-4" />
            {s.back}
          </button>
          <div className="flex flex-col items-center">
            <p className="text-base font-semibold text-[#0A1628]">{s.title}</p>
            <p className="text-xs text-[#0A1628]/40">{s.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle variant="light" />
            <img src={logoImage} alt="Aurevia" className="h-10 w-auto object-contain" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex gap-8 items-start">

            {/* ── LEFT: Order summary ── */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Table header */}
                <div className="grid px-6 py-3 text-[10px] font-bold tracking-widest uppercase"
                  style={{ gridTemplateColumns: '1fr 140px 80px 80px 80px 60px', color: 'rgba(10,22,40,0.35)', borderBottom: '1px solid #F1F5F9' }}>
                  <span>{s.provider}</span>
                  <span>{s.service}</span>
                  <span>{s.duration}</span>
                  <span className="text-right">{s.rate}</span>
                  <span className="text-right">{s.total}</span>
                  <span />
                </div>

                {/* Rows */}
                <AnimatePresence>
                  {visibleCart.map((item, i) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="grid items-center px-6 py-5"
                      style={{
                        gridTemplateColumns: '1fr 140px 80px 80px 80px 60px',
                        borderBottom: i < visibleCart.length - 1 ? '1px solid #F8FAFC' : 'none',
                      }}
                    >
                      {/* Provider */}
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2.5 mb-1">
                          <span className="text-base leading-none">{SERVICE_EMOJI[item.serviceKey] ?? '📦'}</span>
                          <p className="text-sm font-semibold text-[#0A1628] truncate">{item.provider}</p>
                        </div>
                        <p className="text-[11px] text-[#0A1628]/40 pl-[26px] truncate">
                          {item.date}
                        </p>
                      </div>
                      {/* Service */}
                      <div>
                        <span className="inline-block px-2 py-1 rounded-full text-[10px] font-medium bg-[#0A1628]/5 text-[#0A1628]/70">
                          {item.service}
                        </span>
                      </div>
                      {/* Duration */}
                      <p className="text-sm text-[#0A1628]/60">{item.duration}</p>
                      {/* Rate */}
                      <p className="text-sm text-[#0A1628]/60 text-right tabular-nums">{item.unitRate} $</p>
                      {/* Total */}
                      <p className="text-sm font-bold text-[#0A1628] text-right tabular-nums">{item.total} $</p>
                      {/* Remove */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => setRemovedIds(p => [...p, item.id])}
                          className="text-[10px] text-[#0A1628]/25 hover:text-red-400 transition-colors"
                        >
                          {s.remove}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {visibleCart.length === 0 && (
                  <div className="text-center py-16 text-[#0A1628]/30 text-sm">{s.emptyCart}</div>
                )}

                {/* Totals */}
                {visibleCart.length > 0 && (
                  <div className="px-6 pb-5 pt-2 bg-[#FAFAFA] border-t border-gray-100">
                    <AmountRow label={s.subtotal}   value={`${fmt(subtotal)} $`}   />
                    <AmountRow label={s.tps}        value={`${fmt(tps)} $`}        />
                    <AmountRow label={s.tvq}        value={`${fmt(tvq)} $`}        />
                    <AmountRow label={s.grandTotal} value={`${fmt(grandTotal)} $`} bold />
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT: Payment panel ── */}
            <div className="w-[300px] shrink-0 sticky top-8">
              <AnimatePresence mode="wait">
                {payPhase === 'done' ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                      className="size-16 rounded-full flex items-center justify-center mx-auto mb-5"
                      style={{ background: 'rgba(52,211,153,0.12)' }}
                    >
                      <CheckCircle2 className="size-9 text-emerald-400" />
                    </motion.div>
                    <h3 className="text-[#0A1628] text-lg font-semibold mb-2">{s.doneTitle}</h3>
                    <p className="text-[#0A1628]/50 text-xs leading-relaxed mb-6">{s.doneMsg}</p>
                    <button onClick={onBack}
                      className="w-full py-3 rounded-xl text-sm font-semibold text-[#0A1628] bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors">
                      {s.doneClose}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="pay" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Amount banner */}
                    <div className="px-6 pt-6 pb-5 text-center"
                      style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-[#0A1628]/40 mb-1">{s.grandTotal}</p>
                      <motion.p
                        key={grandTotal}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-light text-[#0A1628] tabular-nums"
                      >
                        {fmt(grandTotal)} <span className="text-xl text-[#0A1628]/50">$</span>
                      </motion.p>
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Saved card */}
                      <div>
                        <p className="text-[10px] font-bold tracking-widest uppercase text-[#0A1628]/35 mb-2">
                          {s.savedCard}
                        </p>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-100">
                          <CreditCard className="size-5 text-[#0A1628]/50" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#0A1628]">•••• •••• •••• 4829</p>
                            <p className="text-[10px] text-[#0A1628]/40">Visa · Expire 09/27</p>
                          </div>
                          <ChevronRight className="size-4 text-[#0A1628]/25" />
                        </div>
                      </div>

                      {/* Pay button */}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handlePay}
                        disabled={visibleCart.length === 0 || payPhase === 'processing'}
                        className="w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2.5"
                        style={{
                          background: visibleCart.length > 0
                            ? 'linear-gradient(135deg, #0A1628, #1a2842)'
                            : '#E2E8F0',
                          color:     visibleCart.length > 0 ? 'white' : '#94A3B8',
                          boxShadow: visibleCart.length > 0 ? '0 4px 20px rgba(10,22,40,0.25)' : 'none',
                        }}
                      >
                        {payPhase === 'processing' ? (
                          <>
                            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {s.processing}
                          </>
                        ) : (
                          <>
                            <Lock className="size-4" />
                            {s.payBtn(fmt(grandTotal))}
                          </>
                        )}
                      </motion.button>

                      {/* Security */}
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <ShieldCheck className="size-3.5" style={{ color: '#22C55E' }} />
                        <p className="text-[10px] text-[#0A1628]/35">{s.security}</p>
                      </div>

                      {/* Trust badges */}
                      <div className="flex justify-center gap-4 pt-1">
                        {['SSL', 'PCI DSS', 'STRIPE'].map(badge => (
                          <div key={badge}
                            className="px-2 py-1 rounded text-[9px] font-bold tracking-widest text-[#0A1628]/30"
                            style={{ border: '1px solid #E2E8F0' }}>
                            {badge}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Invoice note */}
                    <div className="px-6 pb-5 flex items-center gap-2">
                      <Receipt className="size-3.5 shrink-0 text-[#0A1628]/25" />
                      <p className="text-[10px] text-[#0A1628]/35 leading-snug">
                        {lang === 'fr'
                          ? 'Une facture unifiée sera générée et envoyée par courriel après le paiement.'
                          : 'A unified invoice will be generated and emailed after payment.'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
