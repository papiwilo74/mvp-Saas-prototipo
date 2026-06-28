import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';

export const listProducts = async (restaurantId, pagination = {}) => {
  const page = pagination.page || 1;
  const pageSize = pagination.pageSize || 20;
  const skip = (page - 1) * pageSize;
  const where = { restaurantId };
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.product.count({ where })
  ]);

  return {
    products,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    }
  };
};

export const createProduct = (restaurantId, data) =>
  prisma.product.create({
    data: {
      ...data,
      restaurantId,
      price: data.price,
      stock: data.trackStock ? (data.stock ?? 0) : null,
      comboItems: data.comboItems || []
    },
    include: { category: true }
  });

export const updateProduct = async (restaurantId, productId, data) => {
  const product = await prisma.product.findFirst({ where: { id: productId, restaurantId } });

  if (!product) throw new ApiError(404, 'Producto no encontrado');

  return prisma.product.update({
    where: { id: productId },
    data: {
      ...data,
      stock: data.trackStock === false ? null : data.stock
    },
    include: { category: true }
  });
};

export const deleteProduct = async (restaurantId, productId) => {
  const product = await prisma.product.findFirst({ where: { id: productId, restaurantId } });

  if (!product) throw new ApiError(404, 'Producto no encontrado');

  await prisma.product.delete({ where: { id: productId } });
};

