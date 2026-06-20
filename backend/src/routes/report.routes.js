import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const reportRouter = Router();

reportRouter.use(authenticate, requireAdmin);
reportRouter.get('/summary', asyncHandler(reportController.summary));
reportRouter.get('/top-products', asyncHandler(reportController.topProducts));