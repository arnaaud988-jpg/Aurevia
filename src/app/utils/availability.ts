// Deterministic availability helpers — seeded by provider ID so the same
// provider always shows the same schedule across sessions.

const HOURLY_RATE_RANGES: Record<string, [number, number]> = {
  'home-staging': [85,  145],
  'photo':        [120, 195],
  'notaire':      [220, 380],
  'inspection':   [110, 160],
  'paysager':     [75,  120],
  'design':       [100, 175],
  'evaluation':   [155, 240],
  'demenagement': [90,  135],
  'pisciniste':   [80,  125],
  'chocolatier':  [65,  95],
  'fleuriste':    [55,  85],
  'nettoyage':    [50,  80],
};

const DAILY_RATE_RANGES: Record<string, [number, number]> = {
  'home-staging': [450, 850],
  'inspection':   [350, 550],
  'demenagement': [400, 750],
  'nettoyage':    [280, 480],
  'paysager':     [350, 600],
};

// Services billed by the day rather than the hour
export const DAILY_CATEGORIES = new Set([
  'home-staging', 'inspection', 'demenagement', 'nettoyage', 'paysager',
]);

export type ServiceMode = 'hourly' | 'daily';

export function getServiceMode(category: string): ServiceMode {
  return DAILY_CATEGORIES.has(category) ? 'daily' : 'hourly';
}

function seed(id: string): number {
  return id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export function getHourlyRate(providerId: string, category: string): number {
  const [min, max] = HOURLY_RATE_RANGES[category] ?? [100, 200];
  const rate = min + (seed(providerId) % (max - min));
  return Math.round(rate / 5) * 5;
}

export function getDailyRate(providerId: string, category: string): number {
  const [min, max] = DAILY_RATE_RANGES[category] ?? [400, 800];
  const rate = min + (seed(providerId) % (max - min));
  return Math.round(rate / 50) * 50;
}

export function getAvailableDaysInMonth(
  providerId: string,
  year: number,
  month: number
): Set<number> {
  const s = seed(providerId);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const available = new Set<number>();
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow === 0 || dow === 6) continue; // no weekends
    if ((s * d * 7 + d * 13) % 10 >= 3) available.add(d); // ~70% of weekdays
  }
  return available;
}

const BASE_SLOTS = [
  '8:30', '9:00', '10:00', '10:30', '11:00',
  '13:00', '13:30', '14:00', '15:00', '15:30', '16:00', '16:30',
];

const DAILY_START_SLOTS = ['7:30', '8:00', '8:30', '9:00', '9:30', '10:00'];

export function getSlotsForDay(
  providerId: string,
  day: number,
  mode: ServiceMode = 'hourly'
): string[] {
  const s = seed(providerId) + day * 17;
  const pool = mode === 'daily' ? DAILY_START_SLOTS : BASE_SLOTS;
  return pool.filter((_, i) => (s + i * 11) % (mode === 'daily' ? 3 : 5) !== 0);
}

export function hasAvailabilityInNextDays(providerId: string, days: number): boolean {
  const today = new Date();
  for (let i = 2; i <= days + 2; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const available = getAvailableDaysInMonth(providerId, d.getFullYear(), d.getMonth());
    if (available.has(d.getDate())) return true;
  }
  return false;
}
