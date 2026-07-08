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
