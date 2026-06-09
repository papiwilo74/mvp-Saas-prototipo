import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createProductSchema,
  productIdSchema,
  updateProductSchema
} from '../validators/product.validator.js';

export const productRouter = Router();

productRouter.use(authenticate, requireAdmin);
productRouter.get('/', asyncHandler(productController.list));
productRouter.post('/', validate(createProductSchema), asyncHandler(productController.create));
productRouter.put('/:id', validate(updateProductSchema), asyncHandler(productController.update));
productRouter.delete('/:id', validate(productIdSchema), asyncHandler(productController.remove));

