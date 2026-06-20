import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from './email.service.js';
import { findOrCreateCustomer } from './customer.service.js';

export const createOrder = async ({ restaurantSlug = 'demo-burger', userId, customer, items, notes, paymentMethod }) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    include: { config: true }
  });

  if (!restaurant) throw new ApiError(404, 'Restaurante no encontrado');

  const productIds = items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, restaurantId: restaurant.id, isAvailable: true }
  });

  if (products.length !== productIds.length) {
    throw new ApiError(400, 'Uno o mas productos no estan disponibles');
  }

  const productsById = new Map(products.map((product) => [product.id, product]));
  const orderItems = items.map((item) => {
    const product = productsById.get(item.productId);
    const unitPrice = Number(product.price);
    const subtotal = unitPrice * item.quantity;

    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      subtotal
    };
  });

  const deliveryFee = Number(restaurant.config?.deliveryFee || 0);
  const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0) + deliveryFee;
  const crmCustomer = await findOrCreateCustomer(restaurant.id, customer);

  const order = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      userId,
      customerId: crmCustomer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      customerAddress: customer.address,
      notes,
      paymentMethod,
      total,
      items: { create: orderItems }
    },
    include: {
      items: { include: { product: true } }
    }
  });

  await sendOrderConfirmationEmail({ to: customer.email, order });

  return order;
};

export const listMyOrders = (userId) =>
  prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });

export const listRestaurantOrders = (restaurantId, filters = {}) => {
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

  return prisma.order.findMany({
    where,
    include: { items: { include: { product: true } }, user: true },
    orderBy: { createdAt: 'desc' }
  });
};

export const updateOrderStatus = async (restaurantId, orderId, status) => {
  const order = await prisma.order.findFirst({ where: { id: orderId, restaurantId } });

  if (!order) throw new ApiError(404, 'Pedido no encontrado');

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: { include: { product: true } } }
  });

  await sendOrderStatusEmail({ to: updatedOrder.customerEmail, order: updatedOrder });

  return updatedOrder;
};
