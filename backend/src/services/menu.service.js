import { prisma } from '../config/prisma.js';

export const getPublicMenu = async (restaurantSlug = 'demo-burger', search = '') => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    include: {
      config: true,
      categories: {
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          products: {
            where: {
              isAvailable: true,
              isDeleted: false,
              ...(search ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { description: { contains: search, mode: 'insensitive' } }
                ]
              } : {})
            },
            orderBy: { name: 'asc' },
            include: { images: { orderBy: { sortOrder: 'asc' } } }
          }
        }
      }
    }
  });

  return restaurant;
};

export const searchProducts = async (restaurantSlug = 'demo-burger', search = '', pagination = {}) => {
  const page = pagination.page || 1;
  const pageSize = pagination.pageSize || 20;
  const skip = (page - 1) * pageSize;

  const restaurant = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } });
  if (!restaurant) return { products: [], pagination: { page, pageSize, total: 0, totalPages: 1 } };

  const where = {
    restaurantId: restaurant.id,
    isAvailable: true,
    isDeleted: false,
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ]
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, images: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { name: 'asc' },
      skip,
      take: pageSize
    }),
    prisma.product.count({ where })
  ]);

  return {
    products,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    }
  };
};
