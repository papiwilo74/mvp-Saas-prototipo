import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import bcrypt from 'bcryptjs';

export const listRestaurants = async () => {
  const restaurants = await prisma.restaurant.findMany({
    include: {
      config: true,
      _count: { select: { orders: true, products: true, categories: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return restaurants;
};

export const getRestaurant = async (restaurantId) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      config: true,
      categories: {
        include: { products: { where: { isDeleted: false } } },
        orderBy: { sortOrder: 'asc' }
      },
      _count: { select: { orders: true, products: true } }
    }
  });

  if (!restaurant) throw new ApiError(404, 'Restaurante no encontrado');
  return restaurant;
};

export const createRestaurant = async (data) => {
  const { name, slug, email, phone, address, adminEmail, adminPassword } = data;

  const existing = await prisma.restaurant.findUnique({ where: { slug } });
  if (existing) throw new ApiError(409, 'El slug ya esta en uso');

  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingUser) throw new ApiError(409, 'El email del admin ya esta en uso');

  const restaurant = await prisma.$transaction(async (tx) => {
    const r = await tx.restaurant.create({
      data: { name, slug, email: email || adminEmail, phone: phone || '', address: address || '' }
    });

    await tx.restaurantConfig.create({
      data: {
        restaurantName: name,
        primaryColor: '#ea580c',
        secondaryColor: '#141414',
        deliveryZones: [],
        coupons: [],
        paymentMethods: ['CASH', 'NEQUI', 'CARD'],
        restaurantId: r.id
      }
    });

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await tx.user.create({
      data: {
        name: `Admin ${name}`,
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        restaurantId: r.id
      }
    });

    return r;
  });

  return restaurant;
};

export const updateRestaurant = async (restaurantId, data) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant) throw new ApiError(404, 'Restaurante no encontrado');

  return prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      name: data.name,
      slug: data.slug,
      email: data.email,
      phone: data.phone,
      address: data.address
    }
  });
};

export const getSuperadminStats = async () => {
  const [totalRestaurants, totalOrders, totalProducts, recentOrders] = await Promise.all([
    prisma.restaurant.count(),
    prisma.order.count(),
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.order.findMany({
      include: { restaurant: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);

  const activeToday = await prisma.order.count({
    where: {
      createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    }
  });

  return {
    totalRestaurants,
    totalOrders,
    totalProducts,
    activeToday,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      total: o.total,
      status: o.status,
      restaurantName: o.restaurant?.name,
      customerName: o.customerName,
      createdAt: o.createdAt
    }))
  };
};
