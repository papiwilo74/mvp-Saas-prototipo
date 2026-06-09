import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate, optionalAuthenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator.js';

export const orderRouter = Router();

orderRouter.post('/', optionalAuthenticate, validate(createOrderSchema), asyncHandler(orderController.create));
orderRouter.get('/mine', authenticate, asyncHandler(orderController.myOrders));
orderRouter.get('/admin', authenticate, requireAdmin, asyncHandler(orderController.adminOrders));
orderRouter.patch(
  '/:id/status',
  authenticate,
  requireAdmin,
  validate(updateOrderStatusSchema),
  asyncHandler(orderController.updateStatus)
);
