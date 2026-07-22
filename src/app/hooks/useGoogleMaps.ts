import { useEffect, useState } from 'react';

// Get API key from environment variable or use empty string for demo mode
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    // If no API key, run in demo mode
    if (!GOOGLE_MAPS_API_KEY) {
      console.log('🗺️ Running in DEMO mode. Add VITE_GOOGLE_MAPS_API_KEY to .env for full functionality.');
      setIsLoaded(true); // Pretend it's loaded for demo
      return;
    }

    // Check if already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    // Load the script with new Places library (v=beta for PlaceAutocompleteElement)
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,marker&v=beta`;
    script.async = true;
    script.defer = true;

    script.addEventListener('load', () => {
      setIsLoaded(true);
    });

    script.addEventListener('error', (e) => {
      console.warn('Google Maps API failed to load - running in demo mode');
      setLoadError(new Error('Failed to load Google Maps'));
      // Still set loaded to true so app continues in demo mode
      setIsLoaded(true);
    });

    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  return { isLoaded, loadError };
}

declare global {
  interface Window {
    google?: {
      maps: any;
    };
  }
}

export {};
