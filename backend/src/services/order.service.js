import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from './email.service.js';
import { emailQueue } from '../queues/email.queue.js';
import { DEFAULT_RESTAURANT_SLUG } from '../config/constants.js';
import { findOrCreateCustomer } from './customer.service.js';
import { logger } from './logger.service.js';
import { emitNewOrder, emitOrderStatusChanged } from './socket.service.js';
import { sendStatusUpdate } from './whatsapp.service.js';
import { notifyOrderStatus } from './push.service.js';
import { getRouteDistanceFromRestaurant } from './maps.service.js';
import {
  normalizeCoupons,
  normalizeZones,
  normalizeLoyalty,
  getTier,
  calculateCouponDiscount,
  calculatePointsDiscount,
  detectZoneFromAddress,
  POINTS_PER_PESO
} from './order.pricing.service.js';
import { validateStock, deductStock } from './order.inventory.service.js';

export { listMyOrders, listRestaurantOrders, listKitchenOrders } from './order.query.service.js';
export {
  normalizeCoupons,
  normalizeZones,
  normalizeLoyalty,
  getTier,
  calculateCouponDiscount,
  calculatePointsDiscount,
  detectZoneFromAddress,
  TIER_THRESHOLDS,
  POINTS_PER_PESO,
  POINTS_VALUE
} from './order.pricing.service.js';
export { validateStock, deductStock } from './order.inventory.service.js';

export const createOrder = async ({
  restaurantSlug = DEFAULT_RESTAURANT_SLUG,
  userId,
  customer,
  items,
  notes,
  paymentMethod,
  couponCode,
  deliveryZoneName,
  scheduledFor,
  pointsRedeemed = 0,
  wompiTransactionId,
  tableNumber
  , fulfillmentMode = 'DELIVERY', customerLatitude, customerLongitude
}) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'El pedido debe contener al menos un producto');
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    include: { config: true }
  });

  if (!restaurant) throw new ApiError(404, 'Tienda o negocio no encontrado');

  const productIds = items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, restaurantId: restaurant.id, isAvailable: true }
  });

  if (products.length !== productIds.length) {
    throw new ApiError(400, 'Uno o más productos no están disponibles o no pertenecen a esta tienda');
  }

  const productsById = new Map(products.map((product) => [product.id, product]));

  validateStock(productsById, items);

  const orderItems = items.map((item) => {
    const product = productsById.get(item.productId);
    const unitPrice = Number(product.price);
    const subtotal = Math.round(unitPrice * item.quantity);

    return { productId: item.productId, quantity: item.quantity, unitPrice, subtotal };
  });

  const subtotal = Math.round(orderItems.reduce((sum, item) => sum + item.subtotal, 0));
  const deliveryZones = normalizeZones(restaurant.config);
  if (fulfillmentMode === 'DELIVERY' && (!Number.isFinite(Number(customerLatitude)) || !Number.isFinite(Number(customerLongitude)))) {
    throw new ApiError(400, 'Selecciona tu ubicación en el mapa para calcular el costo del domicilio');
  }
  const route = fulfillmentMode === 'DELIVERY'
    ? await getRouteDistanceFromRestaurant(restaurant.id, customerLatitude, customerLongitude)
    : null;

  const { zone: detectedZone, geoStatus } = await detectZoneFromAddress(restaurant.id, customer.address, deliveryZones);

  let selectedZone = null;
  const warnings = [];

  if (deliveryZoneName) {
    selectedZone = deliveryZones.find((zone) => zone.name === deliveryZoneName && zone.isActive !== false);

    if (detectedZone && selectedZone && detectedZone.id !== selectedZone.id) {
      if (wompiTransactionId) {
        warnings.push(
          `La dirección ingresada corresponde a la zona "${detectedZone.name}", no a "${selectedZone.name}". El pedido se procesó con "${selectedZone.name}" porque el cobro por Wompi ya fue realizado.`
        );
      } else {
        warnings.push(
          `La dirección ingresada corresponde a la zona "${detectedZone.name}", no a "${selectedZone.name}". Se usará "${detectedZone.name}" como zona de entrega.`
        );
        selectedZone = detectedZone;
      }
    }

    if (!detectedZone && geoStatus === 'geocode_failed') {
      logger.warn({ restaurantId: restaurant.id, zone: selectedZone?.name }, 'No se pudo verificar la dirección. Usando la zona seleccionada.');
    }
  } else if (detectedZone) {
    selectedZone = detectedZone;
  }

  if (geoStatus === 'outside_all_zones' && selectedZone) {
    warnings.push(
      `La dirección ingresada no coincide con ninguna zona registrada. Se usará "${selectedZone.name}" según tu selección.`
    );
  }

  const routeZone = route ? deliveryZones
    .filter((zone) => zone.isActive !== false && Number.isFinite(Number(zone.maxKm)) && Number(zone.maxKm) >= route.distanceKm)
    .sort((a, b) => Number(a.maxKm) - Number(b.maxKm))[0] : null;
  selectedZone = routeZone || selectedZone;
  if (fulfillmentMode === 'DELIVERY' && route && !routeZone) throw new ApiError(400, 'La dirección está fuera de la cobertura de entrega');
  const deliveryFee = fulfillmentMode === 'PICKUP' ? 0 : Math.round(Number(selectedZone?.fee ?? restaurant.config?.deliveryFee ?? 0));
  const coupons = normalizeCoupons(restaurant.config);
  const selectedCoupon = couponCode
    ? coupons.find((coupon) => coupon.code?.toLowerCase() === couponCode.toLowerCase())
    : null;
  const discountAmount = Math.round(calculateCouponDiscount({ subtotal, coupon: selectedCoupon }));
  const loyalty = normalizeLoyalty(restaurant.config);
  const pointsDiscount = Math.round(calculatePointsDiscount({ loyalty, pointsRedeemed }));
  const total = Math.max(0, Math.round(subtotal + deliveryFee - discountAmount - pointsDiscount));

  if (scheduledFor && restaurant.config?.acceptsScheduledOrders) {
    const scheduledDate = new Date(scheduledFor);
    const minimumDate = new Date(Date.now() + Number(restaurant.config?.leadTimeMinutes || 30) * 60000);
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate < minimumDate) {
      throw new ApiError(400, 'La programación del pedido no cumple con el tiempo mínimo requerido');
    }
  }

  const crmCustomer = await findOrCreateCustomer(restaurant.id, customer);

  if (loyalty?.enabled && pointsRedeemed > 0) {
    if ((crmCustomer.points || 0) < pointsRedeemed) {
      throw new ApiError(400, 'Puntos insuficientes para este canje');
    }
  }

  const order = await prisma.$transaction(async (transaction) => {
    await deductStock(transaction, items, productsById);

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

    const paymentStatus = paymentMethod === 'CARD' ? 'APPROVED' : 'PENDING';

    const { lastOrderNumber: orderNumber } = await transaction.orderCounter.upsert({
      where: { restaurantId: restaurant.id },
      create: { restaurantId: restaurant.id, lastOrderNumber: 1 },
      update: { lastOrderNumber: { increment: 1 } }
    });

    return transaction.order.create({
      data: {
        orderNumber,
        restaurantId: restaurant.id,
        userId,
        customerId: crmCustomer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        customerAddress: customer.address,
        customerLatitude: customerLatitude ?? null,
        customerLongitude: customerLongitude ?? null,
        fulfillmentMode,
        deliveryDistanceKm: route?.distanceKm ?? null,
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
        tableNumber: tableNumber || null,
        total,
        items: { create: orderItems }
      },
      include: { items: { include: { product: true } } }
    });
  });

  emitNewOrder(restaurant.id, order);
  emailQueue.add('order-confirmation', { type: 'ORDER_CONFIRMATION', payload: { to: customer.email, order } }).catch(() => {
    Promise.resolve(sendOrderConfirmationEmail({ to: customer.email, order })).catch(() => {});
  });

  return {
    order,
    earnedPoints: loyalty?.enabled ? Math.floor(subtotal * POINTS_PER_PESO) : 0,
    warnings: warnings.length > 0 ? warnings : undefined
  };
};

export const updateOrderStatus = async (restaurantId, orderId, status) => {
  const order = await prisma.order.findFirst({ where: { id: orderId, restaurantId } });

  if (!order) throw new ApiError(404, 'Pedido no encontrado en esta tienda');

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: { include: { product: true } } }
  });

  emitOrderStatusChanged(restaurantId, updatedOrder);
  emailQueue.add('order-status', { type: 'ORDER_STATUS_CHANGE', payload: { to: updatedOrder.customerEmail, order: updatedOrder } }).catch(() => {
    Promise.resolve(sendOrderStatusEmail({ to: updatedOrder.customerEmail, order: updatedOrder })).catch(() => {});
  });
  await sendStatusUpdate(restaurantId, updatedOrder.customerPhone, updatedOrder.orderNumber, status);
  notifyOrderStatus(updatedOrder).catch((err) => {
    logger.warn({ err }, 'Notificación push falló');
  });

  return updatedOrder;
};

export const handlePaymentSuccess = async (reference, wompiTransactionId, amountInCents) => {
  if (!prisma.order?.findFirst) return null;
  let order = null;
  if (reference) {
    order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: reference },
          { wompiTransactionId: reference },
          { wompiTransactionId: wompiTransactionId || undefined }
        ]
      },
      include: { items: { include: { product: true } } }
    });
  }

  if (!order && wompiTransactionId) {
    order = await prisma.order.findFirst({
      where: { wompiTransactionId },
      include: { items: { include: { product: true } } }
    });
  }

  if (!order) {
    logger.warn({ reference, wompiTransactionId, amountInCents }, 'Orden no encontrada para webhook de pago Wompi exitoso');
    return null;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: 'APPROVED',
      wompiTransactionId: wompiTransactionId || order.wompiTransactionId
    },
    include: { items: { include: { product: true } } }
  });

  emitOrderStatusChanged(order.restaurantId, updatedOrder);
  logger.info({ orderId: order.id, orderNumber: order.orderNumber }, 'Pago de orden confirmado vía Wompi');
  return updatedOrder;
};

export const updatePaymentStatus = async (restaurantId, orderId, paymentStatus) => {
  const order = await prisma.order.findFirst({ where: { id: orderId, restaurantId } });

  if (!order) throw new ApiError(404, 'Pedido no encontrado en esta tienda');

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus },
    include: { items: { include: { product: true } } }
  });

  emitOrderStatusChanged(restaurantId, updatedOrder);
  logger.info({ orderId, paymentStatus, restaurantId }, 'Estado de pago de orden actualizado');
  return updatedOrder;
};
