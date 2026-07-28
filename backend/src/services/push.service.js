import webpush from 'web-push';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { logger } from './logger.service.js';

webpush.setVapidDetails(
  'mailto:notifications@fastfoodsaas.com',
  env.VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY
);

export const getVapidPublicKey = () => env.VAPID_PUBLIC_KEY;

export const subscribe = async ({ endpoint, p256dh, auth, userId, customerId, restaurantId }) => {
  const existing = await prisma.pushSubscription.findUnique({ where: { endpoint } });
  if (existing) return existing;

  return prisma.pushSubscription.create({
    data: { endpoint, p256dh, auth, userId, customerId, restaurantId }
  });
};

export const unsubscribe = async (endpoint) => {
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
};

export const sendPushNotification = async ({ subscription, title, body, icon, url }) => {
  const payload = JSON.stringify({ title, body, icon, url });

  try {
    await webpush.sendNotification(subscription, payload);
    return true;
  } catch (error) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      await prisma.pushSubscription.deleteMany({ where: { endpoint: subscription.endpoint } });
      logger.info({ endpoint: subscription.endpoint }, 'Push subscription expirada, eliminada');
    } else {
      logger.error({ err: error }, 'Error al enviar notificacion push');
    }
    return false;
  }
};

const notificationTemplates = {
  PENDING: { title: 'Pedido recibido', body: 'Tu pedido ha sido recibido y pronto comenzara a prepararse.' },
  PREPARING: { title: 'Preparando tu pedido', body: 'Tu pedido esta siendo preparado.' },
  ON_THE_WAY: { title: 'Pedido en camino', body: 'Tu pedido esta en camino.' },
  DELIVERED: { title: 'Pedido entregado', body: 'Tu pedido ha sido entregado. ¡Buen provecho!' },
  CANCELLED: { title: 'Pedido cancelado', body: 'Tu pedido ha sido cancelado.' }
};

export const notifyOrderStatus = async (order) => {
  const template = notificationTemplates[order.status];
  if (!template) return;

  if (!order.customerId) {
    const subs = await prisma.pushSubscription.findMany({
      where: { restaurantId: order.restaurantId, userId: { not: null } }
    });

    for (const sub of subs) {
      sendPushNotification({
        subscription: { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        ...template,
        url: `${env.FRONTEND_URL}/orders/${order.id}`
      }).catch(() => {});
    }
    return;
  }

  const subs = await prisma.pushSubscription.findMany({
    where: {
      OR: [
        { customerId: order.customerId },
        { restaurantId: order.restaurantId, userId: { not: null } }
      ]
    }
  });

  for (const sub of subs) {
    sendPushNotification({
      subscription: { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      ...template,
      url: `${env.FRONTEND_URL}/orders/${order.id}`
    }).catch(() => {});
  }
};
