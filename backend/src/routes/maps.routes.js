import { Router } from 'express';
import * as mapsController from '../controllers/maps.controller.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';

export const mapsRouter = Router();

const validateAddressSchema = z.object({
  query: z.object({
    address: z.string().min(3)
  })
});

mapsRouter.get('/validate-address', optionalAuthenticate, validate(validateAddressSchema), asyncHandler(mapsController.validateAddress));
