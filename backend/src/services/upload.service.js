import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { logger } from './logger.service.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (buffer, options = {}) => {
  const folder = options.folder || 'products';
  const storePrefix = options.storeId ? `store-${options.storeId}` : 'global';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `tutienda-saas/${storePrefix}/${folder}`,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
        format: 'auto',
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto' }
        ],
        ...options,
      },
      (error, result) => {
        if (error) {
          logger.error({ err: error, storeId: options.storeId }, 'Error al subir imagen a Cloudinary');
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

export const deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error({ err: error, publicId }, 'Error deleting image from Cloudinary');
  }
};

export const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  const parts = url.split('/');
  const uploadIndex = parts.findIndex((p) => p === 'upload');
  if (uploadIndex === -1) return null;
  const versionAndPath = parts.slice(uploadIndex + 2).join('/');
  return versionAndPath.replace(/\.[^.]+$/, '');
};
