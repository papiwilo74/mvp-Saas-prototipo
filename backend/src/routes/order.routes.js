import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import * as kitchenController from '../controllers/kitchen.controller.js';
import { authenticate, optionalAuthenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createOrderSchema, listAdminOrdersSchema, updateOrderStatusSchema } from '../validators/order.validator.js';

export const orderRouter = Router();

orderRouter.post('/', optionalAuthenticate, validate(createOrderSchema), asyncHandler(orderController.create));
orderRouter.get('/mine', authenticate, asyncHandler(orderController.myOrders));
orderRouter.get('/admin', authenticate, requireAdmin, validate(listAdminOrdersSchema), asyncHandler(orderController.adminOrders));
orderRouter.get('/kitchen', authenticate, requireAdmin, asyncHandler(kitchenController.kitchenOrders));
orderRouter.patch(
  '/:id/status',
  authenticate,
  requireAdmin,
  validate(updateOrderStatusSchema),
  asyncHandler(orderController.updateStatus)
);
