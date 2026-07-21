import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from './email.service.js';
import { findOrCreateCustomer } from './customer.service.js';
import { emitNewOrder, emitOrderStatusChanged } from './socket.service.js';
import { sendStatusUpdate } from './whatsapp.service.js';
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
  wompiTransactionId,
  tableNumber
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

  validateStock(productsById, items);

  const orderItems = items.map((item) => {
    const product = productsById.get(item.productId);
    const unitPrice = Number(product.price);
    const subtotal = unitPrice * item.quantity;

    return { productId: item.productId, quantity: item.quantity, unitPrice, subtotal };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryZones = normalizeZones(restaurant.config);

  const { zone: detectedZone, geoStatus } = await detectZoneFromAddress(restaurant.id, customer.address, deliveryZones);

  let selectedZone = null;
  const warnings = [];

  if (deliveryZoneName) {
    selectedZone = deliveryZones.find((zone) => zone.name === deliveryZoneName && zone.isActive !== false);

    if (detectedZone && selectedZone && detectedZone.id !== selectedZone.id) {
      if (wompiTransactionId) {
        warnings.push(
          `La direccion ingresada corresponde a la zona "${detectedZone.name}", no a "${selectedZone.name}". El pedido se proceso con "${selectedZone.name}" porque el cobro por Wompi ya fue realizado.`
        );
      } else {
        warnings.push(
          `La direccion ingresada corresponde a la zona "${detectedZone.name}", no a "${selectedZone.name}". Se usara "${detectedZone.name}" como zona de entrega.`
        );
        selectedZone = detectedZone;
      }
    }

    if (!detectedZone && geoStatus === 'geocode_failed') {
      console.warn(
        `[Geocerca] No se pudo verificar direccion para rest. ${restaurant.id}. Usando zona "${selectedZone?.name}" seleccionada por el cliente.`
      );
    }
  } else if (detectedZone) {
    selectedZone = detectedZone;
  }

  if (geoStatus === 'outside_all_zones' && selectedZone) {
    warnings.push(
      `La direccion ingresada no coincide con ninguna zona de entrega. Se usara "${selectedZone.name}" segun tu seleccion.`
    );
  }

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

    const paymentStatus = paymentMethod === 'WOMPI' ? 'PENDING' : 'APPROVED';

    await transaction.orderCounter.upsert({
      where: { restaurantId: restaurant.id },
      create: { restaurantId: restaurant.id, lastOrderNumber: 0 },
      update: {}
    });

    const { lastOrderNumber: orderNumber } = await transaction.orderCounter.update({
      where: { restaurantId: restaurant.id },
      data: { lastOrderNumber: { increment: 1 } }
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
  await sendOrderConfirmationEmail({ to: customer.email, order });

  return {
    order,
    earnedPoints: loyalty?.enabled ? Math.floor(subtotal * POINTS_PER_PESO) : 0,
    warnings: warnings.length > 0 ? warnings : undefined
  };
};

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
  await sendStatusUpdate(restaurantId, updatedOrder.customerPhone, updatedOrder.orderNumber, status);

  return updatedOrder;
};
