import { motion } from 'motion/react';
import logoImage from '../../imports/ca9650a4-70e0-48a4-a137-768e2e319f89-2.png';
import { useLanguage } from '../contexts/LanguageContext';

export function SplashScreen() {
  const { t } = useLanguage();

  const stats = [
    { value: '45 min', label: t.stat1Desc },
    { value: '2 min', label: t.stat2Desc },
    { value: '500+', label: t.stat3Desc },
  ];

  return (
    <div className="size-full relative flex items-center justify-center overflow-hidden" style={{ background: '#07111f' }}>

      {/* ── Layered background ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(212,175,55,0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%', left: '-5%',
          width: '45%', height: '45%',
          background: 'radial-gradient(circle, rgba(26,40,66,0.7) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-10%', right: '-5%',
          width: '50%', height: '50%',
          background: 'radial-gradient(circle, rgba(10,22,40,0.8) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Corner ornaments */}
      {[
        { top: '2rem', left: '2rem', rotate: '0deg' },
        { top: '2rem', right: '2rem', rotate: '90deg' },
        { bottom: '2rem', right: '2rem', rotate: '180deg' },
        { bottom: '2rem', left: '2rem', rotate: '270deg' },
      ].map((pos, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
          className="absolute pointer-events-none"
          style={{ ...pos }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ transform: `rotate(${pos.rotate})` }}>
            <path d="M0 36 L0 0 L36 0" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" fill="none" />
            <circle cx="2" cy="2" r="2" fill="rgba(212,175,55,0.5)" />
          </svg>
        </motion.div>
      ))}

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-8" style={{ maxWidth: '680px' }}>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1, ease: 'easeOut' }}
          className="mb-10"
          style={{ width: '120px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.8), transparent)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={logoImage}
            alt="Aurevia Concierge"
            className="object-contain"
            style={{ width: '340px', height: 'auto' }}
          />
        </motion.div>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 1, ease: 'easeOut' }}
          className="mt-10 mb-12"
          style={{ width: '200px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)' }}
        />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.9 }}
          className="text-white/55 text-sm tracking-[0.22em] uppercase mb-12"
        >
          {t.tagline}
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.9 }}
          className="flex items-center gap-0 mb-14"
        >
          {stats.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className="px-8 flex flex-col items-center gap-1">
                <span className="text-2xl font-light" style={{ color: '#D4AF37' }}>{s.value}</span>
                <span className="text-white/40 text-xs tracking-wider uppercase">{s.label}</span>
              </div>
              {i < stats.length - 1 && (
                <div style={{ width: '1px', height: '36px', background: 'rgba(212,175,55,0.2)' }} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="flex flex-col items-center gap-4"
        >
          <div
            className="overflow-hidden rounded-full"
            style={{ width: '160px', height: '2px', background: 'rgba(255,255,255,0.08)' }}
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ delay: 2, duration: 3.5, ease: 'easeInOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.5), rgba(212,175,55,1))' }}
            />
          </div>

          <motion.p
            animate={{ opacity: [0.35, 0.75, 0.35] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-white/35 text-xs tracking-[0.18em] uppercase"
          >
            {t.initializing}
          </motion.p>
        </motion.div>
      </div>

      {/* Floating gold particles */}
      {[
        { x: '15%', y: '20%', size: 2, delay: 0.5 },
        { x: '82%', y: '15%', size: 3, delay: 1.1 },
        { x: '88%', y: '70%', size: 2, delay: 0.8 },
        { x: '10%', y: '75%', size: 3, delay: 1.4 },
        { x: '50%', y: '8%', size: 2, delay: 0.6 },
        { x: '25%', y: '88%', size: 2, delay: 1.2 },
        { x: '72%', y: '85%', size: 3, delay: 0.9 },
      ].map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: p.x, top: p.y,
            width: `${p.size}px`, height: `${p.size}px`,
            background: '#D4AF37',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0], y: [0, -12, 0] }}
          transition={{ delay: p.delay, duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
