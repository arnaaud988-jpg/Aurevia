import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Users, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

type Tab = 'ai' | 'human';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
}

export interface ConciergeProviderInfo {
  id: string;
  name: string;
  category: string;
  phone?: string;
  rating?: number;
}

interface ConciergeDrawerProps {
  provider: ConciergeProviderInfo;
  onClose: () => void;
}

function getAIResponse(input: string, name: string, lang: 'fr' | 'en'): string {
  const q = input.toLowerCase();
  if (lang === 'fr') {
    if (q.includes('disponib') || q.includes('rdv') || q.includes('réserv') || q.includes('créneau'))
      return `Je vérifie les créneaux disponibles chez ${name}. En règle générale, ils peuvent vous recevoir sous 2 à 5 jours ouvrables. Souhaitez-vous que je transmette une demande de rendez-vous en votre nom ?`;
    if (q.includes('tarif') || q.includes('prix') || q.includes('coût') || q.includes('devis'))
      return `Les tarifs de ${name} varient selon la nature et l'envergure du projet. Je vous recommande de demander un devis personnalisé. Voulez-vous que je prépare cette demande pour vous ?`;
    if (q.includes('savoir') || q.includes('info') || q.includes('qui') || q.includes('présent'))
      return `${name} est un prestataire vérifié par Aurevia, reconnu pour la qualité de ses services dans le Grand Montréal. Leur note client est excellente. Souhaitez-vous d'autres informations ?`;
    if (q.includes('contact') || q.includes('planif') || q.includes('rappel'))
      return `Je peux transmettre votre demande de contact à ${name} dès maintenant. Un responsable vous recontactera sous 24h. Dois-je procéder ?`;
    return `Bien sûr ! Pour mieux orienter votre demande concernant ${name}, pouvez-vous préciser : s'agit-il d'une question sur les disponibilités, les tarifs, ou souhaitez-vous être mis en relation directement ?`;
  } else {
    if (q.includes('availab') || q.includes('book') || q.includes('appoint') || q.includes('slot'))
      return `I'm checking available time slots at ${name}. They can typically accommodate you within 2 to 5 business days. Would you like me to submit an appointment request on your behalf?`;
    if (q.includes('pric') || q.includes('cost') || q.includes('fee') || q.includes('quot'))
      return `Pricing at ${name} depends on the project scope. I recommend requesting a personalized quote. Would you like me to prepare that request for you?`;
    if (q.includes('more') || q.includes('info') || q.includes('about') || q.includes('who'))
      return `${name} is an Aurevia-verified provider, recognized for service quality across Greater Montreal. Their client rating is excellent. Would you like any other details?`;
    if (q.includes('contact') || q.includes('schedul') || q.includes('call'))
      return `I can forward your contact request to ${name} right now. Someone will get back to you within 24 hours. Shall I proceed?`;
    return `Of course! To better handle your request regarding ${name}, could you clarify: is it about availability, pricing, or would you like to be connected directly?`;
  }
}

export function ConciergeDrawer({ provider, onClose }: ConciergeDrawerProps) {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('ai');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [humanForm, setHumanForm] = useState({ name: '', contact: '', message: '' });
  const [humanSubmitted, setHumanSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const txt = lang === 'fr' ? {
    title: 'Assistant Aurevia',
    about: (n: string) => `À propos de ${n}`,
    aiTab: 'Concierge IA',
    humanTab: 'Demande Humaine',
    quickReplies: ['Disponibilités', 'Tarifs', 'En savoir plus', 'Prendre RDV'],
    placeholder: 'Écrire un message...',
    send: 'Envoyer',
    poweredBy: 'Assistant IA Aurevia · Réponses simulées',
    humanHeading: 'Parlez à un conseiller',
    humanSub: 'Un expert Aurevia vous répondra personnellement sous 24h.',
    namePh: 'Votre nom complet',
    contactPh: 'Email ou numéro de téléphone',
    msgPh: 'Décrivez votre demande en quelques mots...',
    submit: 'Envoyer la demande',
    doneTitle: 'Demande transmise !',
    doneMsg: 'Un conseiller Aurevia vous contactera sous 24h. Merci de votre confiance.',
    newMsg: 'Nouvelle demande',
    providerLabel: 'Prestataire',
    nameLabel: 'Nom complet',
    contactLabel: 'Contact',
    requestLabel: 'Votre demande',
  } : {
    title: 'Aurevia Assistant',
    about: (n: string) => `About ${n}`,
    aiTab: 'AI Concierge',
    humanTab: 'Human Request',
    quickReplies: ['Availability', 'Pricing', 'Learn more', 'Book appointment'],
    placeholder: 'Write a message...',
    send: 'Send',
    poweredBy: 'Aurevia AI Assistant · Simulated responses',
    humanHeading: 'Talk to an advisor',
    humanSub: 'An Aurevia expert will personally respond within 24h.',
    namePh: 'Your full name',
    contactPh: 'Email or phone number',
    msgPh: 'Briefly describe your request...',
    submit: 'Send request',
    doneTitle: 'Request sent!',
    doneMsg: 'An Aurevia advisor will contact you within 24h. Thank you for your trust.',
    newMsg: 'New request',
    providerLabel: 'Provider',
    nameLabel: 'Full name',
    contactLabel: 'Contact',
    requestLabel: 'Your request',
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'ai') setMessages([]);
    if (tab === 'human') setHumanSubmitted(false);
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: trimmed, time: now }]);
    setInput('');
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1100 + Math.random() * 700));
    const aiText = getAIResponse(trimmed, provider.name, lang);
    const now2 = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setIsTyping(false);
    setMessages(prev => [...prev, { id: Date.now().toString() + 'a', role: 'ai', text: aiText, time: now2 }]);
  };

  const handleHumanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHumanSubmitted(true);
  };

  const categoryLabel = t.services[provider.category] ?? provider.category;

  return (
    <>
      {/* ── Backdrop ───────────────────────────────────────────────── */}
      {/* z-[1001] sits just above Leaflet controls (z-1000) but below the panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="fixed inset-0 z-[1001]"
        style={{
          background: 'rgba(7, 17, 31, 0.18)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
        }}
      />

      {/* ── Drawer panel ───────────────────────────────────────────── */}
      {/* z-[1100] — above Leaflet (1000) and backdrop (1001) */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        className="fixed right-0 top-0 h-screen flex flex-col z-[1100] overflow-hidden"
        style={{
          width: '408px',
          borderRadius: '20px 0 0 20px',
          boxShadow: '-12px 0 56px rgba(7,17,31,0.22), -1px 0 0 rgba(255,255,255,0.06)',
          background: 'white',
        }}
      >

        {/* ── Header ── */}
        <div
          className="shrink-0 px-5 pt-6 pb-4"
          style={{
            background: 'linear-gradient(150deg, #0A1628 0%, #0f1f3d 60%, #112038 100%)',
            borderRadius: '20px 0 0 0',
          }}
        >
          {/* Title row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Pulsing orb */}
              <div className="relative size-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(212,175,55,0.18)', border: '1px solid rgba(212,175,55,0.35)' }}>
                <Sparkles className="size-4" style={{ color: '#D4AF37' }} />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '1.5px solid rgba(212,175,55,0.4)' }}
                  animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              <div>
                <p className="text-white text-sm font-semibold tracking-wide leading-tight">{txt.title}</p>
                <p className="text-white/40 text-[11px] mt-0.5 truncate" style={{ maxWidth: '230px' }}>
                  {txt.about(provider.name)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="size-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="size-4 text-white/50" />
            </button>
          </div>

          {/* Provider chip */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl mb-4"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <div className="size-2 rounded-full shrink-0 ring-2 ring-[#D4AF37]/30" style={{ background: '#D4AF37' }} />
            <div className="flex-1 min-w-0">
              <p className="text-white/85 text-xs font-medium truncate">{provider.name}</p>
            </div>
            <span className="text-white/30 text-[10px] shrink-0 truncate" style={{ maxWidth: '100px' }}>{categoryLabel}</span>
          </div>

          {/* ── Tab toggle ── */}
          <div className="relative flex rounded-[14px] p-1" style={{ background: 'rgba(0,0,0,0.28)' }}>
            {/* Gold/neutral sliding pill */}
            <motion.div
              className="absolute top-1 bottom-1 rounded-[11px]"
              animate={{
                left: activeTab === 'ai' ? '4px' : 'calc(50% + 0px)',
                width: 'calc(50% - 4px)',
                background: activeTab === 'ai'
                  ? 'linear-gradient(135deg, #D4AF37, #C4A030)'
                  : 'rgba(255,255,255,0.11)',
              }}
              transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            />
            <button
              onClick={() => switchTab('ai')}
              className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold z-10 transition-colors"
              style={{ color: activeTab === 'ai' ? '#0A1628' : 'rgba(255,255,255,0.38)' }}
            >
              <Sparkles className="size-3.5" />
              {txt.aiTab}
            </button>
            <button
              onClick={() => switchTab('human')}
              className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold z-10 transition-colors"
              style={{ color: activeTab === 'human' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.38)' }}
            >
              <Users className="size-3.5" />
              {txt.humanTab}
            </button>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <AnimatePresence mode="wait">

          {/* AI CHAT */}
          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="flex-1 flex flex-col overflow-hidden"
              style={{ background: '#F5F6F8' }}
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

                {/* Welcome bubble */}
                <AiBubble>
                  {lang === 'fr'
                    ? <>Bonjour&nbsp;👋 Je suis votre assistant Aurevia. Comment puis-je vous aider concernant <strong>{provider.name}</strong>&nbsp;?</>
                    : <>Hello&nbsp;👋 I'm your Aurevia assistant. How can I help you with <strong>{provider.name}</strong>?</>
                  }
                </AiBubble>

                {messages.map(msg => (
                  msg.role === 'ai'
                    ? <AiBubble key={msg.id} time={msg.time}>{msg.text}</AiBubble>
                    : <UserBubble key={msg.id} time={msg.time}>{msg.text}</UserBubble>
                ))}

                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-end gap-2.5"
                    >
                      <AvatarOrb />
                      <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-sm"
                        style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                        {[0, 1, 2].map(i => (
                          <motion.span
                            key={i}
                            className="size-1.5 rounded-full block"
                            style={{ background: '#0A1628' }}
                            animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies */}
              <AnimatePresence>
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="shrink-0 px-4 py-3 flex gap-2 overflow-x-auto"
                    style={{ background: '#F5F6F8', borderTop: '1px solid rgba(0,0,0,0.05)' }}
                  >
                    {txt.quickReplies.map((qr, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.07 }}
                        onClick={() => sendMessage(qr)}
                        className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all hover:bg-[#0A1628] hover:text-white hover:border-[#0A1628]"
                        style={{
                          border: '1.5px solid rgba(10,22,40,0.17)',
                          color: '#0A1628',
                          background: 'white',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        }}
                      >
                        {qr}
                        <ChevronRight className="size-3 opacity-35" />
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input bar */}
              <div className="shrink-0 px-4 py-3.5 bg-white border-t border-[#EBEBEB]">
                <div
                  className="flex items-end gap-2 rounded-xl px-3.5 py-2.5 transition-all focus-within:ring-1 focus-within:ring-[#0A1628]/15"
                  style={{ border: '1.5px solid #E8E8E8', background: '#FAFAFA' }}
                >
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
                    }}
                    placeholder={txt.placeholder}
                    rows={1}
                    className="flex-1 resize-none text-sm text-[#0A1628] placeholder-[#0A1628]/30 bg-transparent border-none outline-none leading-relaxed"
                    style={{ maxHeight: '90px' }}
                  />
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isTyping}
                    className="size-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-25 shrink-0"
                    style={{ background: 'linear-gradient(135deg, #0A1628, #1a2842)' }}
                  >
                    <Send className="size-3.5 text-white" />
                  </motion.button>
                </div>
                <p className="text-center text-[10px] text-[#0A1628]/20 mt-2 tracking-wide">{txt.poweredBy}</p>
              </div>
            </motion.div>
          )}

          {/* HUMAN REQUEST */}
          {activeTab === 'human' && (
            <motion.div
              key="human"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="flex-1 overflow-y-auto"
              style={{ background: '#F5F6F8' }}
            >
              <AnimatePresence mode="wait">
                {!humanSubmitted ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-5 flex flex-col gap-4"
                  >
                    {/* Info card */}
                    <div className="flex items-start gap-3 p-4 rounded-2xl"
                      style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
                      <div className="size-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'linear-gradient(135deg, #0A1628, #1a2842)' }}>
                        <Users className="size-5 text-white/75" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0A1628] mb-0.5 leading-tight">{txt.humanHeading}</p>
                        <p className="text-xs text-[#0A1628]/50 leading-relaxed">{txt.humanSub}</p>
                      </div>
                    </div>

                    <form onSubmit={handleHumanSubmit} className="flex flex-col gap-3">
                      <Field label={txt.nameLabel}>
                        <input
                          required type="text" value={humanForm.name}
                          onChange={e => setHumanForm(f => ({ ...f, name: e.target.value }))}
                          placeholder={txt.namePh}
                          className="w-full px-4 py-3 rounded-xl text-sm text-[#0A1628] placeholder-[#0A1628]/30 outline-none"
                          style={{ border: '1.5px solid #E8E8E8', background: 'white' }}
                        />
                      </Field>
                      <Field label={txt.contactLabel}>
                        <input
                          required type="text" value={humanForm.contact}
                          onChange={e => setHumanForm(f => ({ ...f, contact: e.target.value }))}
                          placeholder={txt.contactPh}
                          className="w-full px-4 py-3 rounded-xl text-sm text-[#0A1628] placeholder-[#0A1628]/30 outline-none"
                          style={{ border: '1.5px solid #E8E8E8', background: 'white' }}
                        />
                      </Field>
                      <Field label={txt.requestLabel}>
                        <textarea
                          required rows={4} value={humanForm.message}
                          onChange={e => setHumanForm(f => ({ ...f, message: e.target.value }))}
                          placeholder={txt.msgPh}
                          className="w-full px-4 py-3 rounded-xl text-sm text-[#0A1628] placeholder-[#0A1628]/30 outline-none resize-none"
                          style={{ border: '1.5px solid #E8E8E8', background: 'white' }}
                        />
                      </Field>

                      {/* Provider tag */}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{ background: 'rgba(10,22,40,0.04)', border: '1px solid rgba(10,22,40,0.06)' }}>
                        <div className="size-1.5 rounded-full shrink-0" style={{ background: '#D4AF37' }} />
                        <span className="text-xs text-[#0A1628]/45">
                          {txt.providerLabel} :&nbsp;<span className="font-medium text-[#0A1628]/65">{provider.name}</span>
                        </span>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3.5 rounded-xl text-white text-sm font-semibold mt-1"
                        style={{ background: 'linear-gradient(135deg, #0A1628, #1a2842)', boxShadow: '0 4px 18px rgba(10,22,40,0.28)' }}
                      >
                        {txt.submit}
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 18, stiffness: 220 }}
                    className="flex flex-col items-center justify-center min-h-full p-8 text-center gap-5"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 14, stiffness: 220, delay: 0.08 }}
                      className="size-20 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #0A1628, #1a2842)', boxShadow: '0 8px 32px rgba(10,22,40,0.28)' }}
                    >
                      <CheckCircle2 className="size-9" style={{ color: '#D4AF37' }} />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
                      <p className="text-lg font-semibold text-[#0A1628] mb-2">{txt.doneTitle}</p>
                      <p className="text-sm text-[#0A1628]/50 leading-relaxed max-w-[260px]">{txt.doneMsg}</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl"
                      style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}
                    >
                      <div className="size-1.5 rounded-full" style={{ background: '#D4AF37' }} />
                      <span className="text-xs font-medium" style={{ color: '#B8960C' }}>{provider.name}</span>
                    </motion.div>

                    <button
                      onClick={() => { setHumanSubmitted(false); setHumanForm({ name: '', contact: '', message: '' }); }}
                      className="text-xs text-[#0A1628]/30 hover:text-[#0A1628] transition-colors"
                    >
                      {txt.newMsg}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function AvatarOrb() {
  return (
    <div className="size-7 rounded-full flex items-center justify-center shrink-0 mb-0.5"
      style={{ background: 'linear-gradient(135deg, #0A1628, #1a2842)', flexShrink: 0 }}>
      <Sparkles className="size-3.5" style={{ color: '#D4AF37' }} />
    </div>
  );
}

function AiBubble({ children, time }: { children: React.ReactNode; time?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2.5">
      <AvatarOrb />
      <div style={{ maxWidth: '290px' }}>
        <div className="rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed text-[#0A1628]/80"
          style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          {children}
        </div>
        {time && <p className="text-[10px] text-[#0A1628]/25 mt-1 pl-1">{time}</p>}
      </div>
    </motion.div>
  );
}

function UserBubble({ children, time }: { children: React.ReactNode; time?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-end gap-2.5">
      <div style={{ maxWidth: '290px' }}>
        <div className="rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed text-white"
          style={{ background: 'linear-gradient(135deg, #0A1628, #1a2842)', boxShadow: '0 2px 10px rgba(10,22,40,0.22)' }}>
          {children}
        </div>
        {time && <p className="text-[10px] text-[#0A1628]/25 mt-1 text-right pr-1">{time}</p>}
      </div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-[#0A1628]/40 uppercase tracking-widest block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
