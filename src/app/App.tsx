import { useState } from 'react';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'motion/react';
import { SearchHub } from './components/SearchHub';
import { ResultsDashboard } from './components/ResultsDashboard';
import { FavoritesDashboard } from './components/FavoritesDashboard';
import { DossierDetail } from './components/DossierDetail';
import { CheckoutScreen } from './components/CheckoutScreen';
import { VersionSelector } from './components/VersionSelector';
import { UrgentRequestModal } from './components/UrgentRequestModal';
import { TutorialPanel, TutorialFAB } from './components/TutorialPanel';
import { LanguageProvider } from './contexts/LanguageContext';
import { VersionProvider } from './contexts/VersionContext';

type Screen = 'search' | 'results' | 'favorites' | 'dossier' | 'checkout';

export interface SearchParams {
  address: string;
  service: string;
  serviceTypes?: string[];
}

export default function App() {
  const [currentScreen, setCurrentScreen]         = useState<Screen>('search');
  const [searchParams, setSearchParams]           = useState<SearchParams>({ address: '', service: '' });
  const [selectedDossierId, setSelectedDossierId] = useState<string>('1');
  const [showUrgent, setShowUrgent]               = useState(false);
  const [showTutorial, setShowTutorial]           = useState(false);

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    setCurrentScreen('results');
  };

  const handleDossier = (dossierId: string) => {
    setSelectedDossierId(dossierId);
    setCurrentScreen('dossier');
  };

  return (
    <VersionProvider>
      <LanguageProvider>
        <Toaster position="top-right" richColors />
        <div className="size-full">
          {currentScreen === 'search'    && <SearchHub onSearch={handleSearch} onFavorites={() => setCurrentScreen('favorites')} onDossier={handleDossier} onUrgent={() => setShowUrgent(true)} />}
          {currentScreen === 'results'   && <ResultsDashboard searchParams={searchParams} onBack={() => setCurrentScreen('search')} />}
          {currentScreen === 'favorites' && <FavoritesDashboard onBack={() => setCurrentScreen('search')} onCheckout={() => setCurrentScreen('checkout')} />}
          {currentScreen === 'dossier'   && <DossierDetail dossierId={selectedDossierId} onBack={() => setCurrentScreen('search')} onCheckout={() => setCurrentScreen('checkout')} />}
          {currentScreen === 'checkout'  && <CheckoutScreen onBack={() => setCurrentScreen('search')} />}
        </div>

        {/* Urgent modal */}
        <AnimatePresence>
          {showUrgent && <UrgentRequestModal onClose={() => setShowUrgent(false)} />}
        </AnimatePresence>

        {/* Tutorial panel */}
        <AnimatePresence>
          {showTutorial && <TutorialPanel onClose={() => setShowTutorial(false)} />}
        </AnimatePresence>

        {/* Persistent FABs */}
        <TutorialFAB onClick={() => setShowTutorial(true)} />
        <VersionSelector />
      </LanguageProvider>
    </VersionProvider>
  );
}
