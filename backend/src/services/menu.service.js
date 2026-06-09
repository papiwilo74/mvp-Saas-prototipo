import { prisma } from '../config/prisma.js';

export const getPublicMenu = async (restaurantSlug = 'demo-burger') => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    include: {
      config: true,
      categories: {
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          products: {
            where: { isAvailable: true },
            orderBy: { name: 'asc' }
          }
        }
      }
    }
  });

  return restaurant;
};
