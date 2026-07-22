export interface PlaceResult {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  distance: number;
  category: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  website?: string;
}

export interface SearchOutput {
  providers: PlaceResult[];
  center: { lat: number; lng: number };
}

// Known Quebec city centres — used as fallback when Nominatim is unavailable
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  montreal:   { lat: 45.5017, lng: -73.5673 },
  montréal:   { lat: 45.5017, lng: -73.5673 },
  laval:      { lat: 45.6066, lng: -73.7124 },
  longueuil:  { lat: 45.5316, lng: -73.5116 },
  brossard:   { lat: 45.4581, lng: -73.4506 },
  gatineau:   { lat: 45.4765, lng: -75.7013 },
  québec:     { lat: 46.8139, lng: -71.2080 },
  quebec:     { lat: 46.8139, lng: -71.2080 },
  sherbrooke: { lat: 45.4042, lng: -71.8929 },
  terrebonne: { lat: 45.7000, lng: -73.6333 },
  repentigny: { lat: 45.7333, lng: -73.4500 },
  saguenay:   { lat: 48.4167, lng: -71.0667 },
  'saint-jean': { lat: 45.3081, lng: -73.2636 },
};

function cityFallback(address: string): { lat: number; lng: number } | null {
  const lower = address.toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(city)) return coords;
  }
  return null;
}

// Geocode with Nominatim + deterministic city fallback
async function geocode(address: string): Promise<{ lat: number; lng: number }> {
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 5000);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&accept-language=fr`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(tid);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    // network error or timeout — fall through
  }

  // City-name fallback: scan the address string for known cities
  const fallback = cityFallback(address);
  if (fallback) return fallback;

  throw new Error('Adresse introuvable');
}

// Realistic Quebec providers by service
const POOL: Record<string, Array<{ name: string; phone: string; website?: string }>> = {
  'home-staging': [
    { name: 'Staging Prestige Montréal', phone: '(514) 836-4521', website: 'stagingprestige.ca' },
    { name: 'Mise en Scène Immobilière', phone: '(514) 723-8890' },
    { name: 'Élite Home Staging', phone: '(438) 495-2210', website: 'elitestaging.ca' },
    { name: 'Décor & Vente Experts', phone: '(514) 601-7743' },
  ],
  'photo': [
    { name: 'Lumière & Propriété Photographie', phone: '(514) 902-3344', website: 'lumiereimmo.ca' },
    { name: 'Visions Immobilières', phone: '(438) 312-9900' },
    { name: 'Photos HD Prestige', phone: '(514) 781-5567', website: 'photoshd.ca' },
    { name: 'Studio Panorama Immobilier', phone: '(514) 664-2238' },
  ],
  'notaire': [
    { name: 'Étude Notariale Bergeron & Ass.', phone: '(514) 844-7200', website: 'notairesbergeron.ca' },
    { name: 'Me Sophie Tremblay, Notaire', phone: '(514) 527-3390' },
    { name: 'Notaires du Plateau', phone: '(514) 521-6611', website: 'notairesduplateau.com' },
    { name: 'Étude Notariale Côté-Leblanc', phone: '(514) 739-4400' },
  ],
  'inspection': [
    { name: 'Inspection Bâtiment Pro Québec', phone: '(514) 979-5522', website: 'inspectionpro.ca' },
    { name: 'Expertbâti Inspection', phone: '(450) 688-3311' },
    { name: 'Inspecta-Maison', phone: '(514) 233-8877', website: 'inspectamaison.ca' },
    { name: 'Inspection Diligente MTL', phone: '(514) 556-1100' },
  ],
  'paysager': [
    { name: 'Aménagement Vert & Co', phone: '(514) 365-7890', website: 'amenagementvert.ca' },
    { name: 'Jardins Signature Montréal', phone: '(514) 744-2255' },
    { name: 'Pro-Paysage Laval', phone: '(450) 686-4433', website: 'propaysage.com' },
    { name: 'Création Paysagère Lévesque', phone: '(514) 825-6612' },
  ],
  'design': [
    { name: 'Atelier Intérieur Prestige', phone: '(514) 935-8821', website: 'atelierinterieur.ca' },
    { name: 'Design Habitat Montréal', phone: '(514) 481-2200' },
    { name: 'Studio Déco & Sens', phone: '(438) 777-5544', website: 'studiodecosens.ca' },
    { name: 'Intérieurs Raffinés MTL', phone: '(514) 843-9910' },
  ],
  'evaluation': [
    { name: 'Évaluation Immobilière Gagnon', phone: '(514) 288-4455', website: 'evaluationgagnon.ca' },
    { name: 'Experts Évaluateurs du Québec', phone: '(514) 595-3322' },
    { name: 'Agréé Évaluation Lapointe', phone: '(514) 271-7788', website: 'evaluationlapointe.ca' },
    { name: 'Cabinet Roy & Associés', phone: '(514) 362-9900' },
  ],
  'demenagement': [
    { name: 'Déménagement Express Montréal', phone: '(514) 488-5500', website: 'demexpress.ca' },
    { name: 'Déménageurs Pros du Québec', phone: '(514) 374-7711' },
    { name: 'Transport Caron & Fils', phone: '(450) 661-3344', website: 'transportscaronfils.com' },
    { name: 'Allô Déménagement Rapide', phone: '(514) 992-2288' },
  ],
  'pisciniste': [
    { name: 'Piscines Cristal Montréal', phone: '(514) 337-8822', website: 'piscinescristal.ca' },
    { name: 'Aqua Prestige Services', phone: '(450) 629-4411' },
    { name: 'Pro-Piscine Rive-Nord', phone: '(450) 434-7700', website: 'propiscine.ca' },
    { name: 'Entretien Piscines Laval', phone: '(450) 681-3355' },
  ],
  'chocolatier': [
    { name: 'Chocolaterie Léonard & Fils', phone: '(514) 270-9944', website: 'chocolatleonard.ca' },
    { name: 'Maison du Chocolat Artisan', phone: '(514) 844-6622' },
    { name: 'Atelier Cacao Montréal', phone: '(514) 507-3310', website: 'ateliercacao.ca' },
    { name: 'Les Délices Chocolatés MTL', phone: '(514) 271-8833' },
  ],
  'fleuriste': [
    { name: 'Fleurs Élégance Montréal', phone: '(514) 932-5511', website: 'fleurselegance.ca' },
    { name: 'Atelier Floral Prestige', phone: '(514) 488-7722' },
    { name: 'Jardins en Fleurs MTL', phone: '(514) 276-4400', website: 'jardinsenfleursm.ca' },
    { name: 'La Boutique des Fleurs', phone: '(514) 845-9933' },
  ],
  'nettoyage': [
    { name: 'Nettoyage Prestige Immobilier', phone: '(514) 366-8811', website: 'nettoyageprestige.ca' },
    { name: 'Éclat Propre Services', phone: '(514) 721-5544' },
    { name: 'Pro-Net Résidentiel MTL', phone: '(438) 800-4422', website: 'pronetmtl.ca' },
    { name: 'Nettoyage Express Montréal', phone: '(514) 593-7700' },
  ],
};


// Street suffixes common in Quebec
const STREET_TYPES = ['Rue', 'Avenue', 'Boulevard', 'Place', 'Chemin'];
const STREET_NAMES = [
  'Saint-Laurent', 'des Érables', 'du Parc', 'Sherbrooke', 'Fleury',
  'Papineau', 'Lajeunesse', 'Beaubien', 'Jean-Talon', 'Sainte-Catherine',
  'Ontario', 'Mont-Royal', 'Rosemont', 'Masson', 'Notre-Dame',
];

function randBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function nearbyAddress(lat: number, lng: number, idx: number): { addr: string; lat: number; lng: number } {
  // Small random offset (0.5 – 5 km)
  const radius = randBetween(0.005, 0.045);
  const angle = (idx * 137.5 * Math.PI) / 180; // golden angle spread
  const dLat = radius * Math.cos(angle);
  const dLng = radius * Math.sin(angle) / Math.cos((lat * Math.PI) / 180);
  const pLat = lat + dLat;
  const pLng = lng + dLng;

  const num = Math.floor(randBetween(100, 4999));
  const type = STREET_TYPES[idx % STREET_TYPES.length];
  const name = STREET_NAMES[idx % STREET_NAMES.length];
  return { addr: `${num} ${type} ${name}, Montréal, QC`, lat: pLat, lng: pLng };
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function searchLocalProviders(
  address: string,
  serviceTypes: string[]
): Promise<SearchOutput> {
  let center = { lat: 45.5017, lng: -73.5673 };

  try {
    center = await geocode(address);
  } catch {
    console.warn('Geocoding failed, using default center');
  }

  const providers: PlaceResult[] = [];
  let globalIdx = 0;

  for (const svcType of serviceTypes) {
    const pool = POOL[svcType] ?? [];
    // Pick 2 providers per service type
    const picks = pool.slice(0, 2);

    for (const pick of picks) {
      const { addr, lat, lng } = nearbyAddress(center.lat, center.lng, globalIdx++);
      const dist = haversine(center.lat, center.lng, lat, lng);
      const rating = Math.round(randBetween(42, 50)) / 10; // 4.2 – 5.0
      const reviews = Math.floor(randBetween(18, 280));

      providers.push({
        id: `${svcType}-${globalIdx}`,
        name: pick.name,
        rating,
        reviewCount: reviews,
        distance: Math.round(dist * 10) / 10,
        category: svcType,
        address: addr,
        phone: pick.phone,
        lat,
        lng,
        website: pick.website,
      });
    }
  }

  // Sort by distance
  providers.sort((a, b) => a.distance - b.distance);

  return { providers, center };
}
