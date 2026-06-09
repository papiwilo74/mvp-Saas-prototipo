import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';

export const listProducts = (restaurantId) =>
  prisma.product.findMany({
    where: { restaurantId },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

export const createProduct = (restaurantId, data) =>
  prisma.product.create({
    data: {
      ...data,
      restaurantId,
      price: data.price
    },
    include: { category: true }
  });

export const updateProduct = async (restaurantId, productId, data) => {
  const product = await prisma.product.findFirst({ where: { id: productId, restaurantId } });

  if (!product) throw new ApiError(404, 'Producto no encontrado');

  return prisma.product.update({
    where: { id: productId },
    data,
    include: { category: true }
  });
};

export const deleteProduct = async (restaurantId, productId) => {
  const product = await prisma.product.findFirst({ where: { id: productId, restaurantId } });

  if (!product) throw new ApiError(404, 'Producto no encontrado');

  await prisma.product.delete({ where: { id: productId } });
};

