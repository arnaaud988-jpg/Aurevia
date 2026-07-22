import { ArrowLeft, Download, SlidersHorizontal, ArrowUpDown, Zap, ChevronDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SearchParams } from '../App';
import { MapView } from './MapView';
import { ProviderCard } from './ProviderCard';
import { LanguageToggle } from './LanguageToggle';
import { ConciergeDrawer, ConciergeProviderInfo } from './ConciergeDrawer';
import { useLanguage } from '../contexts/LanguageContext';
import { useVersion } from '../contexts/VersionContext';
import logoImage from '../../imports/2f8e629f-4ee0-4e11-8d04-458f66b26676.png';
import { searchLocalProviders, PlaceResult } from '../services/placesService';
import { hasAvailabilityInNextDays } from '../utils/availability';

interface ResultsDashboardProps {
  searchParams: SearchParams;
  onBack: () => void;
}

type SortOption = 'rating' | 'distance' | 'recent';

const DISTANCE_OPTIONS = [2, 5, 10, 25, 50];

export function ResultsDashboard({ searchParams, onBack }: ResultsDashboardProps) {
  const { t } = useLanguage();
  const { isAlpha } = useVersion();
  const [conciergeProvider, setConciergeProvider] = useState<ConciergeProviderInfo | null>(null);
  const [providers, setProviders] = useState<PlaceResult[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number } | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [disponibleRapid, setDisponibleRapid] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [distOpen, setDistOpen] = useState(false);

  const SORT_LABELS: Record<SortOption, string> = {
    rating: t.bestRated,
    distance: t.nearest,
    recent: t.mostRecent,
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const { providers: found, center: c } = await searchLocalProviders(
          searchParams.address,
          searchParams.serviceTypes || []
        );
        setProviders(found);
        setCenter(c);
        setActiveCategories([]);
      } catch (err) {
        console.error(err);
        setProviders([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [searchParams]);

  const categories = useMemo(
    () => [...new Set(providers.map(p => p.category))],
    [providers]
  );

  const toggleCategory = (cat: string) => {
    setActiveCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filtered = useMemo(() => {
    let list = [...providers];
    list = list.filter(p => p.distance <= maxDistance);
    if (activeCategories.length > 0) {
      list = list.filter(p => activeCategories.includes(p.category));
    }
    if (disponibleRapid) {
      list = isAlpha
        ? list.filter(p => hasAvailabilityInNextDays(p.id, 4))
        : list.filter(p => p.rating >= 4.6);
    }
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'distance') list.sort((a, b) => a.distance - b.distance);
    else if (sortBy === 'recent') list.sort((a, b) => b.reviewCount - a.reviewCount);
    return list;
  }, [providers, maxDistance, activeCategories, disponibleRapid, sortBy, isAlpha]);

  const cityLabel = searchParams.address.split(',').slice(-3, -1).join(',').trim() || searchParams.address;

  // Reactive service label — translates when language changes
  const serviceLabel = useMemo(() => {
    const keys = searchParams.serviceTypes;
    if (!keys || keys.length === 0) return searchParams.service;
    if (keys.length >= 12) return t.allServices; // 12 = total number of service types
    return keys.map(k => t.services[k] ?? k).join(', ');
  }, [searchParams, t]);

  const activeFilterCount =
    (maxDistance < 50 ? 1 : 0) +
    activeCategories.length +
    (disponibleRapid ? 1 : 0) +
    (sortBy !== 'distance' ? 1 : 0);

  return (
    <div className="size-full flex flex-col bg-white">

      {/* Header */}
      <div className="border-b border-[#E5E7EB] bg-white shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={onBack} className="flex items-center gap-2 text-[#0A1628]/50 hover:text-[#0A1628] transition-colors text-sm">
              <ArrowLeft className="size-4" />
              {t.backToSearch}
            </button>
            <div className="flex items-center gap-4">
              <LanguageToggle variant="light" />
              <img src={logoImage} alt="Aurevia Concierge" className="h-14 w-auto object-contain" />
            </div>
          </div>
          <h2 className="text-lg font-medium text-[#0A1628]">{serviceLabel}</h2>
          <p className="text-sm text-[#0A1628]/50 mt-0.5">{t.nearAddress(searchParams.address)}</p>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left — list */}
        <div className="w-1/2 flex flex-col overflow-hidden border-r border-[#E5E7EB]">

          {/* Filter bar */}
          <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#FAFAFA] shrink-0">

            <div className="flex items-center gap-2 mb-2.5">

              {/* Distance dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setDistOpen(o => !o); setSortOpen(false); }}
                  className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-all ${maxDistance < 25 ? 'border-[#0A1628] bg-[#0A1628] text-white' : 'border-[#E5E7EB] bg-white text-[#0A1628]/70 hover:border-[#0A1628]/30'}`}
                >
                  <SlidersHorizontal className="size-3" />
                  {maxDistance} km
                  <ChevronDown className={`size-3 transition-transform ${distOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {distOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1.5 bg-white border border-[#E5E7EB] rounded-xl shadow-xl overflow-hidden z-20"
                      style={{ minWidth: '110px' }}
                    >
                      {DISTANCE_OPTIONS.map(d => (
                        <button
                          key={d}
                          onClick={() => { setMaxDistance(d); setDistOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-[#F9FAFB] ${maxDistance === d ? 'font-semibold text-[#0A1628]' : 'text-[#0A1628]/60'}`}
                        >
                          {d === 50 ? t.allDistances : `${d} km`}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setSortOpen(o => !o); setDistOpen(false); }}
                  className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-all ${sortBy !== 'distance' ? 'border-[#0A1628] bg-[#0A1628] text-white' : 'border-[#E5E7EB] bg-white text-[#0A1628]/70 hover:border-[#0A1628]/30'}`}
                >
                  <ArrowUpDown className="size-3" />
                  {SORT_LABELS[sortBy]}
                  <ChevronDown className={`size-3 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1.5 bg-white border border-[#E5E7EB] rounded-xl shadow-xl overflow-hidden z-20"
                      style={{ minWidth: '160px' }}
                    >
                      {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([val, label]) => (
                        <button
                          key={val}
                          onClick={() => { setSortBy(val); setSortOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-[#F9FAFB] ${sortBy === val ? 'font-semibold text-[#0A1628]' : 'text-[#0A1628]/60'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1" />

              {/* Disponible rapidement toggle */}
              <button
                onClick={() => setDisponibleRapid(v => !v)}
                className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-all ${disponibleRapid ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-[#E5E7EB] bg-white text-[#0A1628]/60 hover:border-amber-300'}`}
              >
                <Zap className={`size-3 ${disponibleRapid ? 'fill-amber-400 text-amber-400' : ''}`} />
                {t.availableQuickly}
                <div className={`ml-1 w-7 h-4 rounded-full transition-colors relative ${disponibleRapid ? 'bg-amber-400' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 size-3 rounded-full bg-white shadow transition-transform ${disponibleRapid ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                </div>
              </button>
            </div>

            {/* Category chips */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {categories.map(cat => {
                  const active = activeCategories.includes(cat);
                  const label = t.services[cat] ?? cat;
                  const short = label.split(' ').slice(0, 2).join(' ');
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`h-7 px-3 rounded-full text-xs font-medium transition-all border ${
                        active
                          ? 'bg-[#0A1628] text-white border-[#0A1628]'
                          : 'bg-white text-[#0A1628]/60 border-[#E5E7EB] hover:border-[#0A1628]/30 hover:text-[#0A1628]'
                      }`}
                    >
                      {short}
                    </button>
                  );
                })}

                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      setMaxDistance(25);
                      setSortBy('distance');
                      setActiveCategories([]);
                      setDisponibleRapid(false);
                    }}
                    className="h-7 px-3 rounded-full text-xs text-[#0A1628]/40 hover:text-[#0A1628] transition-colors"
                  >
                    {t.reset}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Provider list */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="size-10 border-[3px] border-[#0A1628]/10 border-t-[#D4AF37] rounded-full animate-spin" />
                  <p className="text-sm text-[#0A1628]/50">{t.searching}</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-[#0A1628]/50">
                      <span className="font-semibold text-[#0A1628]">{filtered.length}</span>
                      {filtered.length !== providers.length && (
                        <span className="text-[#0A1628]/35"> / {providers.length}</span>
                      )}
                      {' '}{t.result(filtered.length)}
                      {activeFilterCount > 0 && (
                        <span className="ml-1.5 inline-flex items-center justify-center size-4 rounded-full bg-[#0A1628] text-white text-[10px] font-bold">
                          {activeFilterCount}
                        </span>
                      )}
                    </p>
                    <button
                      onClick={() => {}}
                      className="text-xs text-[#0A1628]/50 hover:text-[#0A1628] flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="size-3.5" />
                      {t.exportAll}
                    </button>
                  </div>

                  {filtered.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="text-[#0A1628]/50 mb-1">{t.noResults}</p>
                      <button
                        onClick={() => { setMaxDistance(25); setActiveCategories([]); setDisponibleRapid(false); }}
                        className="text-sm text-[#D4AF37] hover:underline mt-2"
                      >
                        {t.clearFilters}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {filtered.map((provider, idx) => (
                          <motion.div
                            key={provider.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2, delay: idx * 0.03 }}
                          >
                            <ProviderCard provider={provider} index={idx + 1} onConcierge={setConciergeProvider} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right — map */}
        <div className="w-1/2 bg-[#F9FAFB]">
          <MapView providers={filtered} center={center} locationLabel={cityLabel} />
        </div>
      </div>

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
