import { Router } from 'express';
import * as exportController from '../controllers/export.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';

const exportQuerySchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED']).optional(),
    from: z.string().optional(),
    to: z.string().optional()
  }).optional()
});

export const exportRouter = Router();

exportRouter.get('/orders', authenticate, requireAdmin, validate(exportQuerySchema), asyncHandler(exportController.exportOrders));
