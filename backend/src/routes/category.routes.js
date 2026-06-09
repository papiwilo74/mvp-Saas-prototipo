import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createCategorySchema } from '../validators/category.validator.js';

export const categoryRouter = Router();

categoryRouter.use(authenticate, requireAdmin);
categoryRouter.get('/', asyncHandler(categoryController.list));
categoryRouter.post('/', validate(createCategorySchema), asyncHandler(categoryController.create));

