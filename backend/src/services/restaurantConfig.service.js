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
    update: data,
    create: {
      ...data,
      restaurantId
    }
  });

