import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as productController from '../controllers/product.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createProductSchema,
  listProductsSchema,
  productIdSchema,
  updateProductSchema
} from '../validators/product.validator.js';

export const productRouter = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'products');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

productRouter.use(authenticate, requireAdmin);
productRouter.get('/', validate(listProductsSchema), asyncHandler(productController.list));
productRouter.post('/upload-image', upload.single('image'), asyncHandler(productController.uploadImage));
productRouter.post('/', validate(createProductSchema), asyncHandler(productController.create));
productRouter.put('/:id', validate(updateProductSchema), asyncHandler(productController.update));
productRouter.delete('/:id', validate(productIdSchema), asyncHandler(productController.remove));

