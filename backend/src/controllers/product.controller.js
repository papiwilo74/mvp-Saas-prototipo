import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as productService from '../services/product.service.js';
import * as uploadService from '../services/upload.service.js';
import { env } from '../config/env.js';
import { toProductResponse, toProductListResponse } from '../dto/product.dto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const useCloudinary = () => env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET;

const saveToDisk = (buffer) => {
  const uploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'products');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const extension = '.jpg';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
  fs.writeFileSync(path.join(uploadDir, filename), buffer);
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
    res.status(400).json({ message: 'Debes enviar una imagen' });
    return;
  }

  if (useCloudinary()) {
    try {
      const result = await uploadService.uploadImage(req.file.buffer);
      res.status(201).json({ imageUrl: result.secure_url, publicId: result.public_id });
      return;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      res.status(500).json({ message: 'Error al subir la imagen' });
      return;
    }
  }

  if (env.NODE_ENV === 'production') {
    console.warn('WARNING: Cloudinary no configurado. Usando almacenamiento local (efimero en produccion). Configura CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.');
  }

  const imageUrl = saveToDisk(req.file.buffer);
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

