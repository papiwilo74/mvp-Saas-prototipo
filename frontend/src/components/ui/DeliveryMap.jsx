import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

export function DeliveryMap({ onSelect }) {
  const containerRef = useRef(null);
  const markerRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current || !mapboxgl.accessToken) return undefined;
    const map = new mapboxgl.Map({ container: containerRef.current, style: 'mapbox://styles/mapbox/streets-v12', center: [-74.0721, 4.711], zoom: 11 });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.on('click', ({ lngLat }) => {
      markerRef.current?.remove();
      markerRef.current = new mapboxgl.Marker({ color: '#be7c8c' }).setLngLat(lngLat).addTo(map);
      onSelect?.({ latitude: lngLat.lat, longitude: lngLat.lng });
    });
    return () => { markerRef.current?.remove(); map.remove(); };
  }, [onSelect]);
  return mapboxgl.accessToken ? <div ref={containerRef} className="mt-3 h-64 overflow-hidden rounded-2xl border border-stone-200" /> : null;
}
