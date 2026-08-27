import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

export function DeliveryMap({ address, onSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!containerRef.current || !mapboxgl.accessToken) return undefined;
    const map = new mapboxgl.Map({ container: containerRef.current, style: 'mapbox://styles/mapbox/streets-v12', center: [-74.0721, 4.711], zoom: 11 });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.on('click', ({ lngLat }) => {
      markerRef.current?.remove();
      markerRef.current = new mapboxgl.Marker({ color: '#be7c8c' }).setLngLat(lngLat).addTo(map);
      onSelect?.({ latitude: lngLat.lat, longitude: lngLat.lng });
    });
    return () => { markerRef.current?.remove(); map.remove(); mapRef.current = null; };
  }, [onSelect]);

  const searchAddress = async () => {
    if (!address?.trim()) return setMessage('Escribe primero una dirección.');
    setSearching(true); setMessage('Buscando dirección...');
    try {
      const params = new URLSearchParams({ access_token: mapboxgl.accessToken, country: 'co', language: 'es', limit: '1' });
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?${params}`);
      const data = await response.json();
      const feature = data.features?.[0];
      if (!feature || !mapRef.current) return setMessage('No encontramos esa dirección. Ajusta el texto e intenta de nuevo.');
      const [longitude, latitude] = feature.center;
      mapRef.current.flyTo({ center: [longitude, latitude], zoom: 16 });
      markerRef.current?.remove();
      markerRef.current = new mapboxgl.Marker({ color: '#be7c8c' }).setLngLat([longitude, latitude]).addTo(mapRef.current);
      onSelect?.({ latitude, longitude });
      setMessage('Ubicación encontrada. Puedes ajustar el marcador en el mapa.');
    } catch { setMessage('No fue posible buscar la dirección.'); }
    finally { setSearching(false); }
  };

  if (!mapboxgl.accessToken) return null;
  return <>
    <div ref={containerRef} className="mt-3 h-64 overflow-hidden rounded-2xl border border-stone-200" />
    <button type="button" onClick={searchAddress} disabled={searching} className="btn-secondary mt-2 w-full text-sm">{searching ? 'Buscando...' : 'Buscar ubicación en el mapa'}</button>
    {message && <p className="mt-2 text-xs text-stone-500">{message}</p>}
  </>;
}
