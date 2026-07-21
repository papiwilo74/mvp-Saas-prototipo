import { prisma } from '../config/prisma.js';

const DEG_TO_KM = 111.32;

const toRad = (deg) => (deg * Math.PI) / 180;

const haversineDistanceKm = (lat1, lng1, lat2, lng2) => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * DEG_TO_KM * (180 / Math.PI) * Math.asin(Math.sqrt(a));
};

const pointInPolygon = (lat, lng, polygon) => {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
};

const isPointInZone = (lat, lng, zone) => {
  if (zone.polygon && Array.isArray(zone.polygon) && zone.polygon.length >= 3) {
    return pointInPolygon(lat, lng, zone.polygon);
  }
  if (zone.coordinates?.lat != null && zone.coordinates?.lng != null && zone.coordinates?.radiusKm) {
    const distance = haversineDistanceKm(lat, lng, zone.coordinates.lat, zone.coordinates.lng);
    return distance <= zone.coordinates.radiusKm;
  }
  return false;
};

export const isAddressInZone = async (restaurantId, address) => {
  const config = await prisma.restaurantConfig.findUnique({
    where: { restaurantId },
    select: { googleMapsApiKey: true, deliveryZones: true }
  });

  if (!config?.googleMapsApiKey || !address) return null;

  try {
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${config.googleMapsApiKey}`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (geoData.status !== 'OK' || !geoData.results.length) return null;

    const { lat, lng } = geoData.results[0].geometry.location;
    const formattedAddress = geoData.results[0].formatted_address;
    const zones = Array.isArray(config.deliveryZones) ? config.deliveryZones : [];
    const activeZones = zones.filter((z) => z.isActive !== false);

    let matchedZone = null;
    for (const zone of activeZones) {
      if (isPointInZone(lat, lng, zone)) {
        matchedZone = zone;
        break;
      }
    }

    return {
      inZone: !!matchedZone,
      zone: matchedZone
        ? {
            id: matchedZone.id,
            name: matchedZone.name,
            fee: matchedZone.fee,
            minOrder: matchedZone.minOrder,
            estimatedMinutes: matchedZone.estimatedMinutes
          }
        : null,
      latitude: lat,
      longitude: lng,
      formattedAddress
    };
  } catch {
    return null;
  }
};

export const getDistanceFromRestaurant = async (restaurantId, customerLat, customerLng) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: { config: { select: { googleMapsApiKey: true, address: true } } }
  });

  if (!restaurant?.config?.googleMapsApiKey || !restaurant.config.address) return null;

  try {
    const distUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(restaurant.config.address)}&destinations=${customerLat},${customerLng}&key=${restaurant.config.googleMapsApiKey}`;
    const distResponse = await fetch(distUrl);
    const distData = await distResponse.json();

    if (distData.status !== 'OK') return null;

    const element = distData.rows[0]?.elements[0];
    if (element?.status !== 'OK') return null;

    return {
      distance: element.distance,
      duration: element.duration
    };
  } catch {
    return null;
  }
};
