import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';

export const findOrCreateCustomer = async (restaurantId, customer) => {
  const phone = customer.phone?.trim() || null;
  const email = customer.email?.trim() || null;
  const address = customer.address?.trim() || null;

  if (phone) {
    return prisma.customer.upsert({
      where: { restaurantId_phone: { restaurantId, phone } },
      update: {
        name: customer.name,
        email,
        address
      },
      create: {
        restaurantId,
        name: customer.name,
        phone,
        email,
        address
      }
    });
  }

  const existing = email
    ? await prisma.customer.findFirst({ where: { restaurantId, email } })
    : null;

  if (existing) {
    return prisma.customer.update({
      where: { id: existing.id },
      data: { name: customer.name, address }
    });
  }

  return prisma.customer.create({
    data: {
      restaurantId,
      name: customer.name,
      phone,
      email,
      address
    }
  });
};

export const listCustomers = async (restaurantId, search = '') => {
  const where = {
    restaurantId,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const customers = await prisma.customer.findMany({
    where,
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, orderNumber: true, total: true, status: true, createdAt: true }
      },
      _count: { select: { orders: true } }
    },
    orderBy: { updatedAt: 'desc' }
  });

  const totals = await prisma.order.groupBy({
    by: ['customerId'],
    where: {
      restaurantId,
      customerId: { in: customers.map((customer) => customer.id) }
    },
    _sum: { total: true }
  });

  const totalByCustomer = new Map(totals.map((row) => [row.customerId, row._sum.total || 0]));

  return customers.map((customer) => ({
    ...customer,
    totalSpent: totalByCustomer.get(customer.id) || 0,
    lastOrder: customer.orders[0] || null,
    orders: undefined
  }));
};

export const getCustomer = async (restaurantId, customerId) => {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, restaurantId },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } }
      }
    }
  });

  if (!customer) throw new ApiError(404, 'Cliente no encontrado');

  return customer;
};

export const updateCustomerNotes = async (restaurantId, customerId, notes) => {
  const customer = await prisma.customer.findFirst({ where: { id: customerId, restaurantId } });

  if (!customer) throw new ApiError(404, 'Cliente no encontrado');

  return prisma.customer.update({
    where: { id: customerId },
    data: { notes }
  });
};