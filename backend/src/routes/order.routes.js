import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import * as kitchenController from '../controllers/kitchen.controller.js';
import { authenticate, optionalAuthenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { audit } from '../middlewares/audit.middleware.js';
import { createOrderSchema, listAdminOrdersSchema, updateOrderStatusSchema, updatePaymentStatusSchema } from '../validators/order.validator.js';

export const orderRouter = Router();

orderRouter.post('/', optionalAuthenticate, validate(createOrderSchema), asyncHandler(orderController.create));
orderRouter.post('/wompi-webhook', asyncHandler(orderController.wompiWebhook));
orderRouter.get('/mine', authenticate, asyncHandler(orderController.myOrders));
orderRouter.get('/admin', authenticate, requireAdmin, validate(listAdminOrdersSchema), asyncHandler(orderController.adminOrders));
orderRouter.get('/kitchen', authenticate, requireAdmin, asyncHandler(kitchenController.kitchenOrders));
orderRouter.patch(
  '/:id/status',
  authenticate,
  requireAdmin,
  validate(updateOrderStatusSchema),
  audit({ action: 'UPDATE', entityType: 'Order', entityId: (req) => req.params.id, changes: (req) => ({ status: req.validated.body.status }) }),
  asyncHandler(orderController.updateStatus)
);
orderRouter.patch(
  '/:id/payment-status',
  authenticate,
  requireAdmin,
  validate(updatePaymentStatusSchema),
  audit({ action: 'UPDATE', entityType: 'Order', entityId: (req) => req.params.id, changes: (req) => ({ paymentStatus: req.validated.body.paymentStatus }) }),
  asyncHandler(orderController.updatePayment)
);
