import { Router } from 'express';
import * as menuController from '../controllers/menu.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { publicRateLimit } from '../middlewares/rateLimit.middleware.js';

export const menuRouter = Router();

menuRouter.get('/', publicRateLimit, asyncHandler(menuController.getMenu));
