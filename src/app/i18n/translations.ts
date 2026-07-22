export type Language = 'fr' | 'en';

const fr = {
  // Nav / shared
  platformLabel: 'Plateforme B2B',
  favorites: 'Mes Favoris',
  back: 'Retour',
  backToSearch: 'Retour à la recherche',

  // SearchHub hero
  heroTitle: 'Trouvez vos experts immobiliers',
  heroTitleHighlight: 'en moins de 2 minutes',
  heroSubtitle: '45 minutes économisées par dossier — données en temps réel',
  serviceLabel: 'Service',
  servicePlaceholder: 'Quel service ?',
  allServices: 'Tous les services',
  addressLabel: 'Adresse',
  addressPlaceholder: 'Adresse de la propriété...',
  searchButton: 'Rechercher',
  searchHint: 'Autocomplétion OpenStreetMap · Données Québec & Canada',
  confirm: 'Confirmer',
  nSelected: (n: number) => `${n} sélectionné${n > 1 ? 's' : ''}`,
  nServices: (n: number) => `${n} services`,
  searching: 'Recherche des meilleurs experts...',
  loadingInterface: 'Chargement de l\'interface...',

  // Splash animation overlay
  animHeadline: "L'excellence opérationnelle pour les courtiers immobiliers.",
  animStat1: '45 minutes économisées sur chaque transaction.',
  animStat2: 'Trouvez les meilleurs experts locaux en moins de 2 minutes.',

  // SplashScreen
  tagline: 'Plateforme de concierge immobilier B2B',
  initializing: 'Initialisation en cours...',

  // Stats
  stat1Desc: 'économisées / dossier',
  stat2Desc: 'pour trouver un expert',
  stat3Desc: 'fournisseurs vérifiés',

  // Filter bar
  bestRated: 'Meilleure note',
  nearest: 'Le plus proche',
  mostRecent: 'Le plus récent',
  availableQuickly: 'Disponible rapidement',
  reset: 'Réinitialiser',
  allDistances: 'Tous (50 km)',

  // Results
  result: (n: number) => `résultat${n > 1 ? 's' : ''}`,
  exportAll: 'Exporter tout',
  noResults: 'Aucun résultat avec ces filtres',
  clearFilters: 'Effacer les filtres',
  nearAddress: (addr: string) => `Près de ${addr}`,

  // Provider card
  verifiedBy: 'Vérifié par Aurevia',
  copy: 'Copier',
  copied: 'Copié !',
  call: 'Appel',
  schedule: 'Planifier',
  scheduleTooltip: 'Fonctionnalité en développement : Réservation directe et synchronisation de calendrier',
  exportSheet: 'Exporter Fiche',
  concierge: 'Concierge',
  addedToFav: (name: string) => `${name} ajouté aux favoris`,
  removedFromFav: (name: string) => `${name} retiré des favoris`,
  contactCopied: 'Informations de contact copiées',
  exported: 'Exporté vers la fiche immobilière',
  conciergeContact: 'Le concierge Aurevia vous contactera sous peu',

  // Favorites dashboard
  myFavorites: 'Mes Favoris',
  noSavedProviders: 'Aucun prestataire sauvegardé',
  savedProviders: (n: number) =>
    `${n} prestataire${n > 1 ? 's' : ''} sauvegardé${n > 1 ? 's' : ''}`,
  noFavoritesTitle: "Aucun favori pour l'instant",
  noFavoritesDesc:
    "Cliquez sur le cœur à côté d'un prestataire pour le retrouver ici en 2 clics.",
  startSearch: 'Lancer une recherche',
  contactCopiedShort: 'Contact copié',

  // Services
  services: {
    'home-staging': 'Home Staging',
    photo: 'Photographie Professionnelle',
    notaire: 'Services Notariaux',
    inspection: 'Inspection de Bâtiment',
    paysager: 'Aménagement Paysager',
    design: 'Design Intérieur',
    evaluation: 'Évaluation Immobilière',
    demenagement: 'Services de Déménagement',
    pisciniste: 'Pisciniste',
    chocolatier: 'Chocolatier',
    fleuriste: 'Fleuriste',
    nettoyage: 'Nettoyage Immobilier',
  } as Record<string, string>,
};

const en: typeof fr = {
  platformLabel: 'B2B Platform',
  favorites: 'My Favorites',
  back: 'Back',
  backToSearch: 'Back to search',

  heroTitle: 'Find your real estate experts',
  heroTitleHighlight: 'in under 2 minutes',
  heroSubtitle: '45 minutes saved per file — real-time data',
  serviceLabel: 'Service',
  servicePlaceholder: 'Which service?',
  allServices: 'All services',
  addressLabel: 'Address',
  addressPlaceholder: 'Property address...',
  searchButton: 'Search',
  searchHint: 'OpenStreetMap Autocomplete · Québec & Canada Data',
  confirm: 'Confirm',
  nSelected: (n: number) => `${n} selected`,
  nServices: (n: number) => `${n} services`,
  searching: 'Searching for the best experts...',
  loadingInterface: 'Loading interface...',

  animHeadline: 'Operational excellence for real estate brokers.',
  animStat1: '45 minutes saved on every transaction.',
  animStat2: 'Find the best local experts in under 2 minutes.',

  tagline: 'B2B Real Estate Concierge Platform',
  initializing: 'Initializing...',

  stat1Desc: 'saved / file',
  stat2Desc: 'to find an expert',
  stat3Desc: 'verified providers',

  bestRated: 'Best rated',
  nearest: 'Nearest',
  mostRecent: 'Most reviewed',
  availableQuickly: 'Available quickly',
  reset: 'Reset',
  allDistances: 'All (25 km)',

  result: (n: number) => `result${n > 1 ? 's' : ''}`,
  exportAll: 'Export all',
  noResults: 'No results with these filters',
  clearFilters: 'Clear filters',
  nearAddress: (addr: string) => `Near ${addr}`,

  verifiedBy: 'Verified by Aurevia',
  copy: 'Copy',
  copied: 'Copied!',
  call: 'Call',
  schedule: 'Schedule',
  scheduleTooltip: 'Feature in development: Direct booking and calendar sync',
  exportSheet: 'Export Sheet',
  concierge: 'Concierge',
  addedToFav: (name: string) => `${name} added to favorites`,
  removedFromFav: (name: string) => `${name} removed from favorites`,
  contactCopied: 'Contact information copied',
  exported: 'Exported to property sheet',
  conciergeContact: 'Aurevia concierge will contact you shortly',

  myFavorites: 'My Favorites',
  noSavedProviders: 'No saved providers',
  savedProviders: (n: number) => `${n} saved provider${n > 1 ? 's' : ''}`,
  noFavoritesTitle: 'No favorites yet',
  noFavoritesDesc: 'Click the heart next to a provider to find them here in 2 clicks.',
  startSearch: 'Start a search',
  contactCopiedShort: 'Contact copied',

  services: {
    'home-staging': 'Home Staging',
    photo: 'Professional Photography',
    notaire: 'Notarial Services',
    inspection: 'Building Inspection',
    paysager: 'Landscaping',
    design: 'Interior Design',
    evaluation: 'Real Estate Appraisal',
    demenagement: 'Moving Services',
    pisciniste: 'Pool Specialist',
    chocolatier: 'Chocolatier',
    fleuriste: 'Florist',
    nettoyage: 'Property Cleaning',
  } as Record<string, string>,
};

export const translations = { fr, en } as const;
export type Translations = typeof fr;
