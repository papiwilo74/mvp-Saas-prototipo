import { Router } from 'express';
import * as superadminController from '../controllers/superadmin.controller.js';
import { authenticate, requireSuperAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';

export const superadminRouter = Router();

superadminRouter.use(authenticate, requireSuperAdmin);

const createRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    adminEmail: z.string().email(),
    adminPassword: z.string().min(6)
  })
});

const updateRestaurantSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional()
  })
});

const restaurantIdSchema = z.object({
  params: z.object({ id: z.string().min(1) })
});

superadminRouter.get('/stats', asyncHandler(superadminController.stats));
superadminRouter.get('/restaurants', asyncHandler(superadminController.listRestaurants));
superadminRouter.get('/restaurants/:id', validate(restaurantIdSchema), asyncHandler(superadminController.getRestaurant));
superadminRouter.post('/restaurants', validate(createRestaurantSchema), asyncHandler(superadminController.createRestaurant));
superadminRouter.put('/restaurants/:id', validate(updateRestaurantSchema), asyncHandler(superadminController.updateRestaurant));
