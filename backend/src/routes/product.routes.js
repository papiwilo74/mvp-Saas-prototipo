import { Router } from 'express';
import multer from 'multer';
import * as productController from '../controllers/product.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import {
  createProductSchema,
  listProductsSchema,
  productIdSchema,
  updateProductSchema
} from '../validators/product.validator.js';

export const productRouter = Router();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, WEBP, AVIF)'));
    }
  }
});

productRouter.use(authenticate, requireAdmin);
productRouter.get('/', validate(listProductsSchema), asyncHandler(productController.list));
productRouter.post('/upload-image', upload.single('image'), asyncHandler(productController.uploadImage));
productRouter.post('/', validate(createProductSchema), asyncHandler(productController.create));
productRouter.put('/:id', validate(updateProductSchema), asyncHandler(productController.update));
productRouter.delete('/:id', validate(productIdSchema), asyncHandler(productController.remove));
