import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as productService from '../services/product.service.js';
import * as uploadService from '../services/upload.service.js';
import { env } from '../config/env.js';
import { logger } from '../services/logger.service.js';
import { ApiError } from '../utils/apiError.js';
import { toProductResponse, toProductListResponse } from '../dto/product.dto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const useCloudinary = () => env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET;

const MIME_EXTENSION_MAP = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif'
};

const saveToDisk = (file) => {
  const uploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'products');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const extension = MIME_EXTENSION_MAP[file.mimetype] || '.jpg';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
  fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
  return `/uploads/products/${filename}`;
};

export const list = async (req, res) => {
  const result = await productService.listProducts(req.user.restaurantId, req.validated?.query || {});
  res.json(toProductListResponse(result.products, result.pagination));
};

export const create = async (req, res) => {
  const product = await productService.createProduct(req.user.restaurantId, req.validated.body);
  res.status(201).json({ product: toProductResponse(product) });
};

export const uploadImage = async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Debes enviar una imagen válida');
  }

  const storeId = req.user.restaurantId;

  if (useCloudinary()) {
    try {
      const result = await uploadService.uploadImage(req.file.buffer, { storeId });
      res.status(201).json({ imageUrl: result.secure_url, publicId: result.public_id });
      return;
    } catch (error) {
      logger.error({ err: error, storeId }, 'Error al cargar imagen en Cloudinary');
      throw new ApiError(500, 'Error al procesar y subir la imagen');
    }
  }

  if (env.NODE_ENV === 'production') {
    logger.warn('Cloudinary no configurado. Usando almacenamiento local efímero.');
  }

  const imageUrl = saveToDisk(req.file);
  res.status(201).json({ imageUrl });
};

export const update = async (req, res) => {
  const product = await productService.updateProduct(
    req.user.restaurantId,
    req.validated.params.id,
    req.validated.body
  );
  res.json({ product: toProductResponse(product) });
};

export const remove = async (req, res) => {
  await productService.deleteProduct(req.user.restaurantId, req.validated.params.id);
  res.status(204).send();
};
