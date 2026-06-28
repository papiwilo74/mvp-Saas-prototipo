import { prisma } from '../config/prisma.js';

export const getPublicConfig = async (restaurantSlug = 'demo-burger') =>
  prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    select: {
      id: true,
      slug: true,
      config: true
    }
  });

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

