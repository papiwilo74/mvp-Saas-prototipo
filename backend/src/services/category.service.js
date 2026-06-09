import { prisma } from '../config/prisma.js';

export const listCategories = (restaurantId) =>
  prisma.category.findMany({
    where: { restaurantId },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
  });

export const createCategory = (restaurantId, data) =>
  prisma.category.create({
    data: {
      ...data,
      restaurantId
    }
  });

