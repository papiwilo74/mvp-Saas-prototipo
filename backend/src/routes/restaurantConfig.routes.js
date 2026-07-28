import { Router } from 'express';
import * as restaurantConfigController from '../controllers/restaurantConfig.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { updateRestaurantConfigSchema } from '../validators/restaurantConfig.validator.js';

export const restaurantConfigRouter = Router();

const CACHE_FIVE_MINUTES = 300;

restaurantConfigRouter.get('/', (_req, res, next) => {
  res.set('Cache-Control', `public, max-age=${CACHE_FIVE_MINUTES}`);
  next();
}, asyncHandler(restaurantConfigController.getPublic));
restaurantConfigRouter.put(
  '/',
  authenticate,
  requireAdmin,
  validate(updateRestaurantConfigSchema),
  asyncHandler(restaurantConfigController.update)
);

