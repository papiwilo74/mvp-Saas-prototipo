import { prisma } from '../config/prisma.js';

export const getPeakHours = async (restaurantId, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const orders = await prisma.order.findMany({
    where: {
      restaurantId,
      status: { not: 'CANCELLED' },
      createdAt: { gte: since }
    },
    select: { createdAt: true }
  });

  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: `${i}:00`,
    count: 0,
    revenue: 0
  }));

  for (const order of orders) {
    const h = new Date(order.createdAt).getHours();
    hours[h].count++;
  }

  return hours;
};

export const getRevenueByDay = async (restaurantId, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      restaurantId,
      status: { not: 'CANCELLED' },
      createdAt: { gte: since }
    },
    select: { createdAt: true, total: true }
  });

  const dailyMap = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = { date: key, revenue: 0, orders: 0 };
  }

  for (const order of orders) {
    const key = new Date(order.createdAt).toISOString().slice(0, 10);
    if (dailyMap[key]) {
      dailyMap[key].revenue += Number(order.total);
      dailyMap[key].orders++;
    }
  }

  return Object.values(dailyMap).reverse();
};

export const getDashboardSummary = async (restaurantId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalOrders,
    todayOrders,
    monthOrders,
    totalRevenue,
    monthRevenue,
    totalCustomers,
    topProducts,
    statusCounts
  ] = await Promise.all([
    prisma.order.count({ where: { restaurantId } }),
    prisma.order.count({ where: { restaurantId, createdAt: { gte: today } } }),
    prisma.order.count({ where: { restaurantId, createdAt: { gte: monthStart } } }),
    prisma.order.aggregate({ where: { restaurantId, status: { not: 'CANCELLED' } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { restaurantId, status: { not: 'CANCELLED' }, createdAt: { gte: monthStart } }, _sum: { total: true } }),
    prisma.customer.count({ where: { restaurantId } }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { restaurantId, status: { not: 'CANCELLED' } } },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    }),
    prisma.order.groupBy({
      by: ['status'],
      where: { restaurantId }
    })
  ]);

  let topProductsWithNames = [];
  if (topProducts.length > 0) {
    const products = await prisma.product.findMany({
      where: { id: { in: topProducts.map((p) => p.productId) } },
      select: { id: true, name: true }
    });
    const productMap = new Map(products.map((p) => [p.id, p.name]));
    topProductsWithNames = topProducts.map((p) => ({
      productId: p.productId,
      name: productMap.get(p.productId) || 'Desconocido',
      quantity: p._sum.quantity || 0,
      revenue: p._sum.subtotal || 0
    }));
  }

  const totalRev = Number(totalRevenue._sum.total || 0);
  const monthRev = Number(monthRevenue._sum.total || 0);

  return {
    totalOrders,
    todayOrders,
    monthOrders,
    totalRevenue: totalRev,
    monthRevenue: monthRev,
    averageOrderValue: totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0,
    monthAverageOrderValue: monthOrders > 0 ? Math.round(monthRev / monthOrders) : 0,
    totalCustomers,
    topProducts: topProductsWithNames,
    statusBreakdown: statusCounts.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {})
  };
};

export const getFrequentCustomers = async (restaurantId, limit = 10) => {
  const customers = await prisma.customer.findMany({
    where: { restaurantId },
    select: {
      id: true,
      name: true,
      phone: true,
      points: true,
      tier: true,
      _count: { select: { orders: true } }
    },
    orderBy: { orders: { _count: 'desc' } },
    take: limit
  });

  const totals = await prisma.order.groupBy({
    by: ['customerId'],
    where: {
      restaurantId,
      customerId: { in: customers.map((c) => c.id) },
      status: { not: 'CANCELLED' }
    },
    _sum: { total: true }
  });

  const totalMap = new Map(totals.map((t) => [t.customerId, Number(t._sum.total || 0)]));

  return customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    points: c.points,
    tier: c.tier,
    orderCount: c._count.orders,
    totalSpent: totalMap.get(c.id) || 0
  }));
};
