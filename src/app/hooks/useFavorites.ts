import { useState } from 'react';

export interface FavoriteProvider {
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

const KEY = 'aurevia_favorites';

function load(): FavoriteProvider[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteProvider[]>(load);

  const persist = (next: FavoriteProvider[]) => {
    setFavorites(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const toggle = (provider: FavoriteProvider) => {
    const exists = favorites.some(f => f.id === provider.id);
    persist(exists ? favorites.filter(f => f.id !== provider.id) : [...favorites, provider]);
  };

  const remove = (id: string) => persist(favorites.filter(f => f.id !== id));

  const isSaved = (id: string) => favorites.some(f => f.id === id);

  return { favorites, toggle, remove, isSaved };
}
