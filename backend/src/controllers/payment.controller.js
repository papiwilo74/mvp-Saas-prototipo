import * as paymentService from '../services/payment.service.js';
import { ApiError } from '../utils/apiError.js';
import { prisma } from '../config/prisma.js';

export const createWompiLink = async (req, res) => {
  const { amountInCents, reference, customerEmail, restaurantSlug } = req.validated.body;

  let restaurantId = req.user?.restaurantId;
  if (!restaurantId && restaurantSlug) {
    const restaurant = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } });
    if (restaurant) restaurantId = restaurant.id;
  }

  const result = await paymentService.createPaymentLink({
    amountInCents,
    reference,
    restaurantId,
    customerEmail
  });
  res.json(result);
};

export const webhook = async (req, res) => {
  const signature = req.headers['x-signature'];
  const rawBody = req.rawBody || JSON.stringify(req.body);
  const result = await paymentService.processWompiWebhook(rawBody, signature);
  res.json({ success: true, transaction: result });
};

export const verifyTransaction = async (req, res) => {
  const { wompiId } = req.params;
  const result = await paymentService.verifyWompiTransaction(wompiId);
  if (!result) throw new ApiError(404, 'Transaccion no encontrada');
  res.json({ transaction: result });
};
