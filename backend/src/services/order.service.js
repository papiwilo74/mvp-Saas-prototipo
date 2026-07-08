import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from './email.service.js';
import { findOrCreateCustomer } from './customer.service.js';
import { emitNewOrder, emitOrderStatusChanged } from './socket.service.js';

const normalizeCoupons = (config) => Array.isArray(config?.coupons) ? config.coupons : [];
const normalizeZones = (config) => Array.isArray(config?.deliveryZones) ? config.deliveryZones : [];
const normalizeLoyalty = (config) => config?.loyaltyProgram || null;

const TIER_THRESHOLDS = { BRONCE: 0, PLATA: 500, ORO: 2000, DIAMANTE: 5000 };
const POINTS_PER_PESO = 0.01;
const POINTS_VALUE = 10;

const getTier = (points) => {
  if (points >= 5000) return 'DIAMANTE';
  if (points >= 2000) return 'ORO';
  if (points >= 500) return 'PLATA';
  return 'BRONCE';
};

const calculateCouponDiscount = ({ subtotal, coupon }) => {
  if (!coupon || !coupon.isActive) return 0;
  if (coupon.minimumOrder && subtotal < Number(coupon.minimumOrder)) return 0;
  if (coupon.discountType === 'PERCENTAGE') {
    return Math.min(subtotal, subtotal * (Number(coupon.discountValue) / 100));
  }
  return Math.min(subtotal, Number(coupon.discountValue));
};

const calculatePointsDiscount = ({ loyalty, pointsRedeemed }) => {
  if (!loyalty?.enabled || !pointsRedeemed || pointsRedeemed <= 0) return 0;
  return pointsRedeemed * POINTS_VALUE;
};

export const createOrder = async ({
  restaurantSlug = 'demo-burger',
  userId,
  customer,
  items,
  notes,
  paymentMethod,
  couponCode,
  deliveryZoneName,
  scheduledFor,
  pointsRedeemed = 0,
  wompiTransactionId
}) => {
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
    if (product.trackStock && typeof product.stock === 'number' && item.quantity > product.stock) {
      throw new ApiError(400, `Stock insuficiente para ${product.name}`);
    }
    const unitPrice = Number(product.price);
    const subtotal = unitPrice * item.quantity;

    return { productId: item.productId, quantity: item.quantity, unitPrice, subtotal };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryZones = normalizeZones(restaurant.config);
  const selectedZone = deliveryZoneName
    ? deliveryZones.find((zone) => zone.name === deliveryZoneName && zone.isActive !== false)
    : null;
  const deliveryFee = Number(selectedZone?.fee ?? restaurant.config?.deliveryFee ?? 0);
  const coupons = normalizeCoupons(restaurant.config);
  const selectedCoupon = couponCode
    ? coupons.find((coupon) => coupon.code?.toLowerCase() === couponCode.toLowerCase())
    : null;
  const discountAmount = calculateCouponDiscount({ subtotal, coupon: selectedCoupon });
  const loyalty = normalizeLoyalty(restaurant.config);
  const pointsDiscount = calculatePointsDiscount({ loyalty, pointsRedeemed });
  const total = Math.max(0, subtotal + deliveryFee - discountAmount - pointsDiscount);

  if (scheduledFor && restaurant.config?.acceptsScheduledOrders) {
    const scheduledDate = new Date(scheduledFor);
    const minimumDate = new Date(Date.now() + Number(restaurant.config?.leadTimeMinutes || 30) * 60000);
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate < minimumDate) {
      throw new ApiError(400, 'La programacion del pedido no cumple con el tiempo minimo requerido');
    }
  }

  const crmCustomer = await findOrCreateCustomer(restaurant.id, customer);

  if (loyalty?.enabled && pointsRedeemed > 0) {
    if ((crmCustomer.points || 0) < pointsRedeemed) {
      throw new ApiError(400, 'Puntos insuficientes para este canje');
    }
  }

  const order = await prisma.$transaction(async (transaction) => {
    for (const item of items) {
      const product = productsById.get(item.productId);
      if (product.trackStock) {
        await transaction.product.update({
          where: { id: product.id },
          data: { stock: Math.max(0, (product.stock || 0) - item.quantity) }
        });
      }
    }

    if (loyalty?.enabled && pointsRedeemed > 0) {
      await transaction.customer.update({
        where: { id: crmCustomer.id },
        data: { points: Math.max(0, (crmCustomer.points || 0) - pointsRedeemed) }
      });
    }

    const earnedPoints = loyalty?.enabled ? Math.floor(subtotal * POINTS_PER_PESO) : 0;
    const newPoints = earnedPoints + (loyalty?.enabled && pointsRedeemed > 0
      ? Math.max(0, (crmCustomer.points || 0) - pointsRedeemed)
      : (crmCustomer.points || 0));

    await transaction.customer.update({
      where: { id: crmCustomer.id },
      data: {
        points: newPoints,
        tier: getTier(newPoints)
      }
    });

    const paymentStatus = paymentMethod === 'WOMPI' ? 'PENDING' : 'APPROVED';

    return transaction.order.create({
      data: {
        restaurantId: restaurant.id,
        userId,
        customerId: crmCustomer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        customerAddress: customer.address,
        deliveryZoneName: selectedZone?.name || null,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        notes,
        paymentMethod,
        paymentStatus,
        subtotal,
        deliveryFeeApplied: deliveryFee,
        discountAmount,
        pointsRedeemed: pointsRedeemed || 0,
        couponCode: selectedCoupon?.code || null,
        wompiTransactionId: wompiTransactionId || null,
        total,
        items: { create: orderItems }
      },
      include: { items: { include: { product: true } } }
    });
  });

  emitNewOrder(restaurant.id, order);
  await sendOrderConfirmationEmail({ to: customer.email, order });

  return { order, earnedPoints: loyalty?.enabled ? Math.floor(subtotal * POINTS_PER_PESO) : 0 };
};

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

export const updateOrderStatus = async (restaurantId, orderId, status) => {
  const order = await prisma.order.findFirst({ where: { id: orderId, restaurantId } });

  if (!order) throw new ApiError(404, 'Pedido no encontrado');

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: { include: { product: true } } }
  });

  emitOrderStatusChanged(restaurantId, updatedOrder);
  await sendOrderStatusEmail({ to: updatedOrder.customerEmail, order: updatedOrder });

  return updatedOrder;
};
