import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';

export const paymentRouter = Router();

const createPaymentLinkSchema = z.object({
  body: z.object({
    amountInCents: z.coerce.number().int().positive(),
    reference: z.string().min(1),
    customerEmail: z.string().email().optional()
  })
});

paymentRouter.post('/create-link', optionalAuthenticate, validate(createPaymentLinkSchema), asyncHandler(paymentController.createWompiLink));
paymentRouter.post('/webhook', asyncHandler(paymentController.webhook));
paymentRouter.get('/verify/:wompiId', asyncHandler(paymentController.verifyTransaction));
