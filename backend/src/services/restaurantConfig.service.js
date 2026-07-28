import { DEFAULT_RESTAURANT_SLUG } from '../config/constants.js';
import { prisma } from '../config/prisma.js';

const PUBLIC_CONFIG_FIELDS = [
  'id', 'restaurantName', 'logoUrl', 'heroImageUrl', 'primaryColor', 'secondaryColor',
  'phone', 'whatsapp', 'address', 'email', 'facebookUrl', 'instagramUrl',
  'openingHours', 'businessHours', 'acceptsScheduledOrders', 'leadTimeMinutes',
  'deliveryFee', 'deliveryZones', 'coupons', 'paymentMethods', 'wompiPublicKey',
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

export const updateConfig = async (restaurantId, data) =>
  prisma.restaurantConfig.upsert({
    where: { restaurantId },
    update: {
      ...data,
      deliveryZones: data.deliveryZones || [],
      coupons: data.coupons || [],
      businessHours: data.businessHours || null
    },
    create: {
      ...data,
      deliveryZones: data.deliveryZones || [],
      coupons: data.coupons || [],
      businessHours: data.businessHours || null,
      restaurantId
    }
  });

