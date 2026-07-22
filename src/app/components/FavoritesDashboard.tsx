import { ArrowLeft, Heart, Phone, Copy, MapPin, MessageCircle, ShieldCheck, Star, Trash2, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { ConciergeDrawer, ConciergeProviderInfo } from './ConciergeDrawer';
import logoImage from '../../imports/2f8e629f-4ee0-4e11-8d04-458f66b26676.png';

interface FavoritesDashboardProps {
  onBack: () => void;
  onCheckout?: () => void;
}

export function FavoritesDashboard({ onBack, onCheckout }: FavoritesDashboardProps) {
  const { favorites, remove } = useFavorites();
  const { t } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [conciergeProvider, setConciergeProvider] = useState<ConciergeProviderInfo | null>(null);

  const handleCopy = (p: typeof favorites[0]) => {
    navigator.clipboard.writeText(`${p.name}\n${p.phone}\n${p.address}`);
    setCopiedId(p.id);
    toast.success(t.contactCopiedShort);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRemove = (p: typeof favorites[0]) => {
    remove(p.id);
    toast.success(t.removedFromFav(p.name));
  };

  const grouped = favorites.reduce<Record<string, typeof favorites>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div className="size-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-[#E5E7EB] bg-white shrink-0">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#0A1628]/50 hover:text-[#0A1628] transition-colors text-sm"
          >
            <ArrowLeft className="size-4" />
            {t.back}
          </button>
          <div className="flex items-center gap-4">
            <LanguageToggle variant="light" />
            <img src={logoImage} alt="Aurevia" className="h-14 w-auto object-contain" />
          </div>
        </div>

        {/* Title row */}
        <div className="px-6 pb-4 flex items-center gap-3">
          <div className="size-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0A1628,#1a2842)' }}>
            <Heart className="size-4 fill-[#D4AF37] text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#0A1628]">{t.myFavorites}</h2>
            <p className="text-xs text-[#0A1628]/45">
              {favorites.length === 0
                ? t.noSavedProviders
                : t.savedProviders(favorites.length)}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center"
          >
            <div className="size-20 rounded-full bg-[#F9FAFB] border-2 border-dashed border-[#E5E7EB] flex items-center justify-center">
              <Heart className="size-8 text-[#0A1628]/15" />
            </div>
            <div>
              <p className="text-[#0A1628]/60 font-medium mb-1">{t.noFavoritesTitle}</p>
              <p className="text-sm text-[#0A1628]/35 max-w-xs">{t.noFavoritesDesc}</p>
            </div>
            <button
              onClick={onBack}
              className="mt-2 px-6 py-3 bg-[#0A1628] text-white rounded-xl text-sm font-medium hover:bg-[#1a2842] transition-colors"
            >
              {t.startSearch}
            </button>
          </motion.div>
        ) : (
          <div className="p-6 space-y-8">
            {Object.entries(grouped).map(([category, providers]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold text-[#0A1628]/40 uppercase tracking-widest">{t.services[category] ?? category}</span>
                  <div className="flex-1 h-px bg-[#E5E7EB]" />
                  <span className="text-xs text-[#0A1628]/30">{providers.length}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {providers.map((p) => (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-xl border border-[#D4AF37]/30 p-5 relative"
                        style={{ boxShadow: '0 2px 16px rgba(212,175,55,0.07)' }}
                      >
                        <button
                          onClick={() => handleRemove(p)}
                          className="absolute top-3 right-3 size-7 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors group"
                          aria-label={t.back}
                        >
                          <Trash2 className="size-3.5 text-[#0A1628]/25 group-hover:text-red-400 transition-colors" />
                        </button>

                        <div className="pr-6 mb-3">
                          <h3 className="text-sm font-semibold text-[#0A1628] mb-1 leading-tight">{p.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-[#0A1628]/50">
                            <div className="flex items-center gap-1">
                              <Star className="size-3 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium text-[#0A1628]">{p.rating}</span>
                              <span>({p.reviewCount})</span>
                            </div>
                            <span>·</span>
                            <MapPin className="size-3" />
                            <span>{p.distance} km</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 mb-3">
                          <ShieldCheck className="size-3" style={{ color: '#B8960C' }} />
                          <span className="text-[10px] font-medium tracking-wide" style={{ color: '#B8960C' }}>
                            {t.verifiedBy}
                          </span>
                        </div>

                        {p.phone && (
                          <p className="text-xs text-[#0A1628]/60 flex items-center gap-1.5 mb-1">
                            <Phone className="size-3 shrink-0" />
                            {p.phone}
                          </p>
                        )}
                        <p className="text-xs text-[#0A1628]/45 flex items-start gap-1.5 mb-4 leading-snug">
                          <MapPin className="size-3 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{p.address}</span>
                        </p>

                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            onClick={() => handleCopy(p)}
                            className="flex items-center justify-center gap-1.5 py-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors text-xs text-[#0A1628]"
                          >
                            <Copy className="size-3" />
                            {copiedId === p.id ? t.copied : t.copy}
                          </button>
                          <button
                            onClick={() => { window.location.href = `tel:${p.phone}`; }}
                            className="flex items-center justify-center gap-1.5 py-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors text-xs text-[#0A1628]"
                          >
                            <Phone className="size-3" />
                            {t.call}
                          </button>
                          <button
                            onClick={() => setConciergeProvider(p)}
                            className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-white transition-all active:scale-95"
                            style={{ background: '#0A1628' }}
                          >
                            <MessageCircle className="size-3" />
                            {t.concierge}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout sticky footer */}
      {favorites.length > 0 && onCheckout && (
        <div className="shrink-0 px-6 py-4 bg-white border-t border-[#E5E7EB]">
          <button
            onClick={onCheckout}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg, #0A1628, #1a2842)',
              color: 'white',
              boxShadow: '0 4px 16px rgba(10,22,40,0.2)',
            }}
          >
            <ShoppingCart className="size-4" />
            {t.favorites} — Facturer {favorites.length} prestataire{favorites.length > 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Concierge drawer */}
      <AnimatePresence>
        {conciergeProvider && (
          <ConciergeDrawer
            provider={conciergeProvider}
            onClose={() => setConciergeProvider(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
