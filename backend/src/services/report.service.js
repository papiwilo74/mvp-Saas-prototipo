import { prisma } from '../config/prisma.js';

const rangeStart = (range) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  if (range === 'week') {
    const day = date.getDay() || 7;
    date.setDate(date.getDate() - day + 1);
  }

  if (range === 'month') {
    date.setDate(1);
  }

  return date;
};

export const getSalesSummary = async (restaurantId) => {
  const [today, week, month] = await Promise.all(
    ['day', 'week', 'month'].map((range) =>
      prisma.order.aggregate({
        where: {
          restaurantId,
          status: { not: 'CANCELLED' },
          createdAt: { gte: rangeStart(range) }
        },
        _sum: { total: true },
        _count: { id: true }
      })
    )
  );

  return {
    today: { revenue: today._sum.total || 0, orders: today._count.id },
    week: { revenue: week._sum.total || 0, orders: week._count.id },
    month: { revenue: month._sum.total || 0, orders: month._count.id }
  };
};

export const getTopProducts = async (restaurantId) => {
  const rows = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: { order: { restaurantId, status: { not: 'CANCELLED' } } },
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 8
  });

  const products = await prisma.product.findMany({
    where: { id: { in: rows.map((row) => row.productId) } },
    select: { id: true, name: true }
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  return rows.map((row) => ({
    productId: row.productId,
    name: productById.get(row.productId)?.name || 'Producto eliminado',
    quantity: row._sum.quantity || 0,
    revenue: row._sum.subtotal || 0
  }));
};