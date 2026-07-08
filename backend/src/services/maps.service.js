import { prisma } from '../config/prisma.js';

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
    const zones = Array.isArray(config.deliveryZones) ? config.deliveryZones : [];

    return { latitude: lat, longitude: lng, formattedAddress: geoData.results[0].formatted_address };
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
