import { DEFAULT_RESTAURANT_SLUG } from '../config/constants.js';
import { prisma } from '../config/prisma.js';

const PUBLIC_CONFIG_FIELDS = [
  'id', 'restaurantName', 'logoUrl', 'heroImageUrl', 'primaryColor', 'secondaryColor',
  'phone', 'whatsapp', 'address', 'email', 'facebookUrl', 'instagramUrl',
  'openingHours', 'businessHours', 'acceptsScheduledOrders', 'leadTimeMinutes',
  'deliveryFee', 'deliveryZones', 'storeLatitude', 'storeLongitude', 'deliveryModes', 'coupons', 'paymentMethods', 'wompiPublicKey',
  'loyaltyProgram',
];

export const getPublicConfig = async (restaurantSlug = DEFAULT_RESTAURANT_SLUG) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    select: {
      id: true,
      slug: true,
      config: true
    }
  });

  if (!restaurant?.config) return restaurant;

  const sanitized = {};
  for (const key of PUBLIC_CONFIG_FIELDS) {
    if (key in restaurant.config) {
      sanitized[key] = restaurant.config[key];
    }
  }

  return { ...restaurant, config: sanitized };
};

export const updateConfig = async (restaurantId, data) => {
  const safeData = { ...data };
  for (const field of ['wompiPrivateKey', 'whatsappToken']) {
    if (!safeData[field]) delete safeData[field];
  }
  const saved = await prisma.restaurantConfig.upsert({
    where: { restaurantId },
    update: {
      ...safeData,
      deliveryZones: safeData.deliveryZones || [],
      storeLatitude: safeData.storeLatitude ?? null,
      storeLongitude: safeData.storeLongitude ?? null,
      deliveryModes: safeData.deliveryModes || ['DELIVERY', 'PICKUP'],
      coupons: safeData.coupons || [],
      businessHours: safeData.businessHours || null
    },
    create: {
      ...safeData,
      deliveryZones: safeData.deliveryZones || [],
      storeLatitude: safeData.storeLatitude ?? null,
      storeLongitude: safeData.storeLongitude ?? null,
      deliveryModes: safeData.deliveryModes || ['DELIVERY', 'PICKUP'],
      coupons: safeData.coupons || [],
      businessHours: safeData.businessHours || null,
      restaurantId
    }
  });
  return { ...saved, wompiPrivateKey: undefined, whatsappToken: undefined, secretStatus: {
    wompiPrivateKey: Boolean(saved.wompiPrivateKey), whatsappToken: Boolean(saved.whatsappToken)
  } };
};
