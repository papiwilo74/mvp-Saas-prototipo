import { Router } from 'express';
import { optionalAuthenticate } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { subscribe, unsubscribe, getVapidPublicKey } from '../services/push.service.js';

export const pushRouter = Router();

pushRouter.get('/vapid-public-key', (_req, res) => {
  res.json({ publicKey: getVapidPublicKey() });
});

pushRouter.post('/subscribe', optionalAuthenticate, asyncHandler(async (req, res) => {
  const { endpoint, p256dh, auth } = req.body;
  if (!endpoint || !p256dh || !auth) {
    return res.status(400).json({ message: 'endpoint, p256dh y auth son requeridos' });
  }

  const sub = await subscribe({
    endpoint,
    p256dh,
    auth,
    userId: req.user?.id || null,
    customerId: req.body.customerId || null,
    restaurantId: req.user?.restaurantId || req.body.restaurantId || null
  });

  res.status(201).json(sub);
}));

pushRouter.delete('/unsubscribe', asyncHandler(async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ message: 'endpoint requerido' });

  await unsubscribe(endpoint);
  res.json({ message: 'Suscripcion eliminada' });
}));
