import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const analyticsRouter = Router();

analyticsRouter.use(authenticate, requireAdmin);
analyticsRouter.get('/peak-hours', asyncHandler(analyticsController.peakHours));
analyticsRouter.get('/revenue-by-day', asyncHandler(analyticsController.revenueByDay));
analyticsRouter.get('/frequent-customers', asyncHandler(analyticsController.frequentCustomers));
