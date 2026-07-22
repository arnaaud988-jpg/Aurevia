import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  rating: number;
  distance: number;
  category: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
}

interface MapViewProps {
  providers: Provider[];
  center?: { lat: number; lng: number };
  locationLabel?: string;
}

function makeIcon(n: number) {
  return L.divIcon({
    html: `<div style="
      width:32px;height:32px;border-radius:50%;
      background:#0A1628;border:2px solid #D4AF37;
      display:flex;align-items:center;justify-content:center;
      color:#D4AF37;font-weight:700;font-size:12px;
      font-family:Inter,sans-serif;
      box-shadow:0 3px 10px rgba(0,0,0,0.35);
    ">${n}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
    className: '',
  });
}

export function MapView({ providers, center, locationLabel }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const defaultCenter: [number, number] = [
    center?.lat ?? 45.5017,
    center?.lng ?? -73.5673,
  ];

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-center when center changes
  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.setView([center.lat, center.lng], 13, { animate: true });
  }, [center]);

  // Redraw markers when providers change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (providers.length === 0) return;

    const bounds: [number, number][] = [];

    providers.forEach((p, i) => {
      const marker = L.marker([p.lat, p.lng], { icon: makeIcon(i + 1) }).addTo(map);

      const stars = '★'.repeat(Math.round(p.rating));
      marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;padding:4px 6px;min-width:210px;">
          <p style="margin:0 0 5px;font-weight:600;font-size:13px;color:#0A1628;">${p.name}</p>
          <p style="margin:0 0 4px;font-size:12px;color:#D4AF37;">
            ${stars} <span style="color:#888;font-size:11px;">${p.rating} · ${p.category}</span>
          </p>
          <p style="margin:0 0 2px;font-size:11px;color:#666;">📍 ${p.distance} km</p>
          ${p.phone ? `<p style="margin:4px 0 0;font-size:11px;font-weight:600;color:#0A1628;">📞 ${p.phone}</p>` : ''}
        </div>
      `, { maxWidth: 270 });

      bounds.push([p.lat, p.lng]);
      markersRef.current.push(marker);
    });

    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true });
  }, [providers]);

  return (
    <div className="size-full relative">
      <div ref={containerRef} className="size-full" />

      {/* Badge overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-2.5 pointer-events-none">
        <MapPin className="size-4 shrink-0" style={{ color: '#D4AF37' }} />
        <div>
          <p className="text-xs font-semibold text-[#0A1628]">{locationLabel ?? 'Zone de recherche'}</p>
          <p className="text-xs text-[#0A1628]/50">
            {providers.length} expert{providers.length > 1 ? 's' : ''} trouvé{providers.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
