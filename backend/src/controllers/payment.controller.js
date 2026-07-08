import * as paymentService from '../services/payment.service.js';
import { ApiError } from '../utils/apiError.js';

export const createWompiLink = async (req, res) => {
  const { amountInCents, reference, customerEmail } = req.validated.body;
  const result = await paymentService.createPaymentLink({
    amountInCents,
    reference,
    restaurantId: req.user.restaurantId,
    customerEmail
  });
  res.json(result);
};

export const webhook = async (req, res) => {
  const result = await paymentService.processWompiWebhook(req.body);
  res.json({ success: true, transaction: result });
};

export const verifyTransaction = async (req, res) => {
  const { wompiId } = req.params;
  const result = await paymentService.verifyWompiTransaction(wompiId);
  if (!result) throw new ApiError(404, 'Transaccion no encontrada');
  res.json({ transaction: result });
};
