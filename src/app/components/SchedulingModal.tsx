import { useState, useMemo } from 'react';
import {
  X, Clock, DollarSign, CheckCircle2, CalendarCheck,
  Minus, Plus, ChevronLeft, ChevronRight, Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getHourlyRate, getDailyRate, getServiceMode,
  getAvailableDaysInMonth, getSlotsForDay,
  ServiceMode,
} from '../utils/availability';

export interface SchedulingProvider {
  id: string;
  name: string;
  category: string;
  phone?: string;
}

interface SchedulingModalProps {
  provider: SchedulingProvider;
  onClose: () => void;
}

const WEEKDAY_LABELS = {
  fr: ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
};

function formatMonthYear(date: Date, lang: string) {
  return date.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    month: 'long', year: 'numeric',
  });
}

function formatDateShort(date: Date, lang: string) {
  return date.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

function formatDateFull(date: Date, lang: string) {
  return date.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function fmtCurrency(n: number) {
  return n >= 1000 ? `${(n / 1000).toLocaleString('fr-CA', { minimumFractionDigits: 1 }).replace('.', ' ')} k` : `${n}`;
}

// ── Duration stepper ──────────────────────────────────────────────────────────

function DurationStepper({
  value, unit, min, max, onChange,
}: {
  value: number; unit: string; min: number; max: number;
  onChange: (v: number, dir: 1 | -1) => void;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-2 py-2"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => value > min && onChange(value - 1, -1)}
        className="size-8 rounded-xl flex items-center justify-center transition-all shrink-0"
        style={{
          background: value > min ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.03)',
          color: value > min ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
          cursor: value > min ? 'pointer' : 'default',
        }}
      >
        <Minus className="size-3.5" />
      </motion.button>

      <div className="flex-1 text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`val-${value}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.13 }}
            className="text-white text-xl font-light tabular-nums"
          >
            {value}
          </motion.span>
        </AnimatePresence>
        <span className="text-sm ml-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
          {unit}
        </span>
      </div>

      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => value < max && onChange(value + 1, 1)}
        className="size-8 rounded-xl flex items-center justify-center transition-all shrink-0"
        style={{
          background: value < max ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.03)',
          color: value < max ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
          cursor: value < max ? 'pointer' : 'default',
        }}
      >
        <Plus className="size-3.5" />
      </motion.button>
    </div>
  );
}

// ── Criterion bar ─────────────────────────────────────────────────────────────

function SlotPill({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{
        background: selected ? 'rgba(212,175,55,0.2)'       : 'rgba(255,255,255,0.04)',
        color:      selected ? '#D4AF37'                     : 'rgba(255,255,255,0.55)',
        border:     `1px solid ${selected ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      <Clock className="size-2.5" />
      {label}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function SchedulingModal({ provider, onClose }: SchedulingModalProps) {
  const { lang } = useLanguage();

  const defaultMode = getServiceMode(provider.category);
  const [mode, setMode] = useState<ServiceMode>(defaultMode);
  const isDaily = mode === 'daily';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minBookable = new Date(today);
  minBookable.setDate(today.getDate() + 2);
  const maxBookable = new Date(today);
  maxBookable.setDate(today.getDate() + 60);

  const [displayMonth, setDisplayMonth] = useState<Date>(() => {
    const m = new Date(today);
    m.setDate(1);
    return m;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration]         = useState(defaultMode === 'daily' ? 1 : 2);
  const [booked, setBooked]             = useState(false);
  const [durDir, setDurDir]             = useState<1 | -1>(1);

  const minDur = 1;
  const maxDur = isDaily ? 14 : 8;

  const switchMode = (next: ServiceMode) => {
    if (next === mode) return;
    setMode(next);
    setSelectedDate(null);
    setSelectedTime(null);
    setDuration(next === 'daily' ? 1 : 2);
  };

  const rate  = isDaily
    ? getDailyRate(provider.id, provider.category)
    : getHourlyRate(provider.id, provider.category);
  const total = rate * duration;

  // End date for range selection (daily mode only)
  const endDate = useMemo<Date | null>(() => {
    if (!selectedDate || !isDaily || duration <= 1) return null;
    const e = new Date(selectedDate);
    e.setDate(e.getDate() + duration - 1);
    return e;
  }, [selectedDate, isDaily, duration]);

  const availDays = useMemo(
    () => getAvailableDaysInMonth(provider.id, displayMonth.getFullYear(), displayMonth.getMonth()),
    [provider.id, displayMonth]
  );

  // Calendar grid (Mon-first)
  const firstDow    = (new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const canPrev = displayMonth > new Date(today.getFullYear(), today.getMonth(), 1);
  const canNext = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1) <
                  new Date(today.getFullYear(), today.getMonth() + 2, 1);

  const changeMonth = (delta: number) => {
    const m = new Date(displayMonth);
    m.setMonth(m.getMonth() + delta);
    setDisplayMonth(m);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleDayClick = (day: number) => {
    const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
    if (date < minBookable || date > maxBookable || !availDays.has(day)) return;
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleDurationChange = (v: number, dir: 1 | -1) => {
    setDurDir(dir);
    setDuration(v);
    setSelectedTime(null);
  };

  const slots = useMemo(() => {
    if (!selectedDate) return [];
    return getSlotsForDay(provider.id, selectedDate.getDate(), mode);
  }, [provider.id, selectedDate, mode]);

  const canConfirm = selectedDate && (isDaily || selectedTime !== null);

  const handleConfirm = () => { if (canConfirm) setBooked(true); };

  const handleUrgent = () => {
    toast.success(
      lang === 'fr'
        ? "Demande d'urgence envoyée — le prestataire vous contactera sous 1h"
        : 'Urgent request sent — provider will contact you within 1 hour'
    );
    onClose();
  };

  const s = lang === 'fr' ? {
    title:         'Planifier une réservation',
    rateHourly:    'TARIF HORAIRE',
    rateDaily:     'TARIF JOURNALIER',
    unitHourly:    (n: number) => n > 1 ? 'heures' : 'heure',
    unitDaily:     (n: number) => n > 1 ? 'jours'  : 'jour',
    perHour:       '/ h',
    perDay:        '/ j',
    durationLabel: 'DURÉE',
    slotsTitle:    isDaily ? 'DATE DE DÉBUT' : 'CRÉNEAUX DISPONIBLES',
    selectDate:    'Sélectionnez une date pour voir les disponibilités',
    noSlots:       'Aucun créneau ce jour-là',
    total:         'Total estimé',
    confirm:       'Confirmer la réservation',
    urgentBtn:     'Demander une intervention urgente (hors délais)',
    cancel:        'Annuler',
    bookedTitle:   'Réservation confirmée !',
    bookedSub:     'Une confirmation vous sera envoyée par courriel.',
    bookedClose:   'Fermer',
    currency:      '$',
    rangeLabel:    (n: number) => `Séjour de ${n} jour${n > 1 ? 's' : ''}`,
    toLabel:       '→',
    legendAvail:   'Disponible',
    legendSelected:'Sélectionné',
    legendRange:   'Plage réservée',
  } : {
    title:         'Schedule a booking',
    rateHourly:    'HOURLY RATE',
    rateDaily:     'DAILY RATE',
    unitHourly:    (n: number) => n > 1 ? 'hours' : 'hour',
    unitDaily:     (n: number) => n > 1 ? 'days'  : 'day',
    perHour:       '/ hr',
    perDay:        '/ day',
    durationLabel: 'DURATION',
    slotsTitle:    isDaily ? 'START DATE' : 'AVAILABLE SLOTS',
    selectDate:    'Select a date to see available slots',
    noSlots:       'No slots on this day',
    total:         'Estimated total',
    confirm:       'Confirm booking',
    urgentBtn:     'Request urgent intervention (out-of-hours)',
    cancel:        'Cancel',
    bookedTitle:   'Booking confirmed!',
    bookedSub:     'A confirmation will be sent to your email.',
    bookedClose:   'Close',
    currency:      '$',
    rangeLabel:    (n: number) => `${n}-day stay`,
    toLabel:       '→',
    legendAvail:   'Available',
    legendSelected:'Selected',
    legendRange:   'Booked range',
  };

  const unitLabel = isDaily ? s.unitDaily(duration) : s.unitHourly(duration);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 flex items-center justify-center z-[1300] px-4"
      style={{ background: 'rgba(3,8,18,0.82)', backdropFilter: 'blur(14px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 22 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 22 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full rounded-3xl overflow-hidden"
        style={{
          maxWidth: '740px',
          background: 'rgba(8,16,32,0.99)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 48px 96px rgba(0,0,0,0.78)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">

          {/* ── SUCCESS STATE ── */}
          {booked ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 px-8 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="size-24 rounded-full flex items-center justify-center mb-8"
                style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}
              >
                <CheckCircle2 className="size-12" style={{ color: '#34D399' }} />
              </motion.div>

              <motion.h2
                initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
                className="text-white text-2xl font-light mb-3"
              >
                {s.bookedTitle}
              </motion.h2>

              <motion.div
                initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}
                className="space-y-1.5 mb-6"
              >
                <p className="text-white/70 text-base font-medium">{provider.name}</p>
                {selectedDate && (
                  <p className="text-white/40 text-sm">
                    {cap(formatDateFull(selectedDate, lang))}
                    {endDate && ` ${s.toLabel} ${cap(formatDateFull(endDate, lang))}`}
                  </p>
                )}
                <p className="text-sm font-medium" style={{ color: '#D4AF37' }}>
                  {selectedTime && `${lang === 'fr' ? 'à' : 'at'} ${selectedTime} · `}
                  {duration} {unitLabel} · {fmtCurrency(total)} {s.currency}
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                className="text-white/30 text-sm mb-8"
              >
                {s.bookedSub}
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                onClick={onClose}
                className="px-8 py-3 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)' }}
              >
                {s.bookedClose}
              </motion.button>
            </motion.div>

          ) : (

            /* ── BOOKING FORM ── */
            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Header */}
              <div
                className="flex items-center justify-between px-7 py-5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="size-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}
                  >
                    <CalendarCheck className="size-4" style={{ color: '#D4AF37' }} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-tight">{s.title}</p>
                    <p className="text-white/35 text-[11px] mt-0.5">{provider.name}</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors">
                  <X className="size-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex">

                {/* ════ LEFT: Calendar ════ */}
                <div className="flex-1 p-6" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>

                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-5">
                    <button
                      onClick={() => canPrev && changeMonth(-1)}
                      className="size-7 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        color:       canPrev ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.12)',
                        background:  canPrev ? 'rgba(255,255,255,0.05)' : 'transparent',
                        cursor:      canPrev ? 'pointer' : 'default',
                      }}
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <p className="text-white text-sm font-medium capitalize">
                      {formatMonthYear(displayMonth, lang)}
                    </p>
                    <button
                      onClick={() => canNext && changeMonth(1)}
                      className="size-7 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        color:      canNext ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.12)',
                        background: canNext ? 'rgba(255,255,255,0.05)' : 'transparent',
                        cursor:     canNext ? 'pointer' : 'default',
                      }}
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 mb-1">
                    {WEEKDAY_LABELS[lang as 'fr' | 'en'].map(d => (
                      <div key={d} className="text-center text-[10px] font-bold tracking-wider py-1.5"
                        style={{ color: 'rgba(255,255,255,0.22)' }}>
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Day grid */}
                  <div className="grid grid-cols-7">
                    {cells.map((day, idx) => {
                      if (!day) return <div key={`e-${idx}`} />;

                      const cellDate   = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
                      const isPast     = cellDate < minBookable;
                      const isFuture   = cellDate > maxBookable;
                      const isAvail    = availDays.has(day) && !isPast && !isFuture;
                      const isStart    = !!selectedDate && cellDate.getTime() === selectedDate.getTime();
                      const isEnd      = !!endDate && cellDate.getTime() === endDate.getTime();
                      const isInRange  = !!selectedDate && !!endDate &&
                                         cellDate > selectedDate && cellDate < endDate &&
                                         cellDate.getMonth() === displayMonth.getMonth();

                      const showRangeBar = isStart || isEnd || isInRange;
                      const highlighted  = isStart || isEnd;

                      // text color
                      let color = isAvail ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.15)';
                      if (highlighted) color = '#07111f';
                      if (isInRange)   color = '#D4AF37';

                      return (
                        <div key={day} className="relative flex items-center justify-center" style={{ height: '38px' }}>

                          {/* Range bar */}
                          {showRangeBar && (
                            <div
                              className="absolute inset-y-[6px]"
                              style={{
                                left:       isStart ? '50%' : 0,
                                right:      isEnd   ? '50%' : 0,
                                background: highlighted
                                  ? 'rgba(212,175,55,0.22)'
                                  : 'rgba(212,175,55,0.13)',
                                zIndex: 0,
                              }}
                            />
                          )}

                          {/* Day button */}
                          <button
                            onClick={() => handleDayClick(day)}
                            className="relative z-10 size-[30px] flex items-center justify-center rounded-full text-[11px] font-medium transition-all"
                            style={{
                              background: highlighted ? '#D4AF37' : 'transparent',
                              color,
                              cursor: isAvail ? 'pointer' : 'default',
                              border: isStart ? '1px solid #D4AF37' : isEnd ? '1px solid rgba(212,175,55,0.5)' : '1px solid transparent',
                            }}
                            onMouseEnter={e => {
                              if (isAvail && !highlighted)
                                (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.14)';
                            }}
                            onMouseLeave={e => {
                              if (isAvail && !highlighted)
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                            }}
                          >
                            {day}
                          </button>

                          {/* Available dot (when not selected) */}
                          {isAvail && !isStart && !isEnd && !isInRange && (
                            <span
                              className="absolute bottom-[4px] left-1/2 -translate-x-1/2 size-[3px] rounded-full"
                              style={{ background: '#34D399', zIndex: 1 }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div
                    className="flex items-center gap-4 mt-4 pt-4 flex-wrap"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="size-[6px] rounded-full" style={{ background: '#34D399' }} />
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.28)' }}>{s.legendAvail}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="size-[14px] rounded-full flex items-center justify-center text-[7px] font-bold"
                        style={{ background: '#D4AF37', color: '#07111f' }}>•</span>
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.28)' }}>{s.legendSelected}</span>
                    </div>
                    {isDaily && duration > 1 && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-[6px] rounded-sm" style={{ background: 'rgba(212,175,55,0.22)' }} />
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.28)' }}>{s.legendRange}</span>
                      </div>
                    )}
                  </div>

                  {/* Range summary pill */}
                  <AnimatePresence>
                    {selectedDate && endDate && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.18)' }}
                      >
                        <CalendarCheck className="size-3 shrink-0" style={{ color: '#D4AF37' }} />
                        <span className="text-[11px]" style={{ color: 'rgba(212,175,55,0.8)' }}>
                          {cap(formatDateShort(selectedDate, lang))}
                          {' '}{s.toLabel}{' '}
                          {cap(formatDateShort(endDate, lang))}
                          {' · '}
                          {s.rangeLabel(duration)}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ════ RIGHT: Details ════ */}
                <div className="w-[264px] shrink-0 p-6 flex flex-col gap-5">

                  {/* Dynamic rate card */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={mode}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="rounded-xl p-4"
                      style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <DollarSign className="size-3.5" style={{ color: '#D4AF37' }} />
                        <span
                          className="text-[10px] font-bold tracking-widest uppercase"
                          style={{ color: 'rgba(212,175,55,0.65)' }}
                        >
                          {isDaily ? s.rateDaily : s.rateHourly}
                        </span>
                      </div>
                      <p className="text-white text-2xl font-light">
                        {rate}
                        <span className="text-sm ml-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                          {s.currency}{isDaily ? s.perDay : s.perHour}
                        </span>
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {/* ── Mode toggle: Heures / Jours ── */}
                  <div
                    className="flex items-center rounded-xl p-1 gap-1"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {(['hourly', 'daily'] as ServiceMode[]).map(m => {
                      const active = mode === m;
                      const label  = m === 'hourly'
                        ? (lang === 'fr' ? 'Heures' : 'Hours')
                        : (lang === 'fr' ? 'Jours'  : 'Days');
                      return (
                        <motion.button
                          key={m}
                          onClick={() => switchMode(m)}
                          layout
                          className="flex-1 py-2 rounded-lg text-xs font-semibold transition-colors relative"
                          style={{ color: active ? '#07111f' : 'rgba(255,255,255,0.38)' }}
                        >
                          {active && (
                            <motion.div
                              layoutId="mode-pill"
                              className="absolute inset-0 rounded-lg"
                              style={{ background: '#D4AF37' }}
                              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10">{label}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Duration stepper */}
                  <div>
                    <p
                      className="text-[10px] font-bold tracking-widest uppercase mb-2.5"
                      style={{ color: 'rgba(255,255,255,0.28)' }}
                    >
                      {s.durationLabel}
                    </p>
                    <DurationStepper
                      value={duration}
                      unit={unitLabel}
                      min={minDur}
                      max={maxDur}
                      onChange={handleDurationChange}
                    />
                  </div>

                  {/* Slots (hourly) / Date display (daily) */}
                  <div className="flex-1 min-h-0">
                    <p
                      className="text-[10px] font-bold tracking-widest uppercase mb-2.5"
                      style={{ color: 'rgba(255,255,255,0.28)' }}
                    >
                      {s.slotsTitle}
                    </p>

                    {isDaily ? (
                      /* ── Daily mode: show selected start date ── */
                      <AnimatePresence mode="wait">
                        {!selectedDate ? (
                          <motion.p
                            key="no-date"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-xs leading-relaxed"
                            style={{ color: 'rgba(255,255,255,0.22)' }}
                          >
                            {s.selectDate}
                          </motion.p>
                        ) : (
                          <motion.div
                            key={selectedDate.toDateString()}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div
                              className="flex items-start gap-3 px-3.5 py-3 rounded-xl"
                              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
                            >
                              <CalendarCheck className="size-4 shrink-0 mt-0.5" style={{ color: '#D4AF37' }} />
                              <div>
                                <p className="text-white text-sm font-medium leading-tight">
                                  {cap(formatDateShort(selectedDate, lang))}
                                </p>
                                {endDate && (
                                  <p className="text-[11px] mt-1" style={{ color: 'rgba(212,175,55,0.65)' }}>
                                    → {cap(formatDateShort(endDate, lang))}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    ) : (
                      /* ── Hourly mode: time-slot pills ── */
                      !selectedDate ? (
                        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.22)' }}>
                          {s.selectDate}
                        </p>
                      ) : slots.length === 0 ? (
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>{s.noSlots}</p>
                      ) : (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={selectedDate.toDateString()}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.18 }}
                            className="flex flex-wrap gap-1.5"
                          >
                            {slots.map(slot => (
                              <SlotPill
                                key={slot}
                                label={slot}
                                selected={selectedTime === slot}
                                onClick={() => setSelectedTime(prev => prev === slot ? null : slot)}
                              />
                            ))}
                          </motion.div>
                        </AnimatePresence>
                      )
                    )}
                  </div>

                  {/* Total */}
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.total}</span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={`${rate}-${duration}`}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                          className="text-white font-semibold text-lg tabular-nums"
                        >
                          {fmtCurrency(total)}
                          <span className="text-sm font-normal ml-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
                            {s.currency}
                          </span>
                        </motion.span>
                      </AnimatePresence>
                    </div>

                    {selectedDate && (isDaily || selectedTime) && (
                      <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-[10px] mt-1 truncate"
                        style={{ color: 'rgba(212,175,55,0.55)' }}
                      >
                        {duration} {unitLabel}
                        {selectedTime && ` · ${selectedTime}`}
                        {' · '}{cap(formatDateShort(selectedDate, lang))}
                        {endDate && ` ${s.toLabel} ${cap(formatDateShort(endDate, lang))}`}
                      </motion.p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col gap-2">

                    {/* Primary confirm */}
                    <motion.button
                      whileTap={canConfirm ? { scale: 0.97 } : {}}
                      onClick={handleConfirm}
                      className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: canConfirm
                          ? 'linear-gradient(135deg, #D4AF37, #B8962F)'
                          : 'rgba(212,175,55,0.08)',
                        color:  canConfirm ? '#07111f' : 'rgba(212,175,55,0.3)',
                        cursor: canConfirm ? 'pointer' : 'default',
                        boxShadow: canConfirm ? '0 4px 20px rgba(212,175,55,0.28)' : 'none',
                      }}
                    >
                      {s.confirm}
                    </motion.button>

                    {/* Urgent ghost button */}
                    <button
                      onClick={handleUrgent}
                      className="w-full py-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                      style={{
                        border:     '1px solid rgba(212,175,55,0.22)',
                        color:      'rgba(212,175,55,0.55)',
                        background: 'transparent',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.5)';
                        (e.currentTarget as HTMLElement).style.color       = '#D4AF37';
                        (e.currentTarget as HTMLElement).style.background  = 'rgba(212,175,55,0.06)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.22)';
                        (e.currentTarget as HTMLElement).style.color       = 'rgba(212,175,55,0.55)';
                        (e.currentTarget as HTMLElement).style.background  = 'transparent';
                      }}
                    >
                      <Zap className="size-3.5" />
                      {s.urgentBtn}
                    </button>

                    {/* Cancel */}
                    <button
                      onClick={onClose}
                      className="w-full py-2 rounded-xl text-xs transition-colors"
                      style={{ color: 'rgba(255,255,255,0.22)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.22)')}
                    >
                      {s.cancel}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
