import { prisma } from '../config/prisma.js';

export const listMyOrders = (userId) =>
  prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });

export const listRestaurantOrders = (restaurantId, filters = {}) => {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const skip = (page - 1) * pageSize;
  const where = { restaurantId };

  if (filters.status) where.status = filters.status;
  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = new Date(filters.from);
    if (filters.to) {
      const endDate = new Date(filters.to);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  return Promise.all([
    prisma.order.findMany({
      where,
      include: { items: { include: { product: true } }, user: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.order.count({ where })
  ]).then(([orders, total]) => ({
    orders,
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
  }));
};

export const listKitchenOrders = async (restaurantId) =>
  prisma.order.findMany({
    where: { restaurantId, status: { in: ['PENDING', 'PREPARING'] } },
    include: { items: { include: { product: true } } },
    orderBy: [{ scheduledFor: { sort: 'asc', nulls: 'first' } }, { createdAt: 'asc' }]
  });
