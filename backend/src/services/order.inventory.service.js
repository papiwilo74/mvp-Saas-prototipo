import { ApiError } from '../utils/apiError.js';

export const validateStock = (productsById, items) => {
  for (const item of items) {
    const product = productsById.get(item.productId);
    if (product.trackStock && typeof product.stock === 'number' && item.quantity > product.stock) {
      throw new ApiError(400, `Stock insuficiente para ${product.name}`);
    }
  }
};

export const deductStock = async (transaction, items, productsById) => {
  for (const item of items) {
    const product = productsById.get(item.productId);
    if (product.trackStock) {
      await transaction.product.update({
        where: { id: product.id },
        data: { stock: Math.max(0, (product.stock || 0) - item.quantity) }
      });
    }
  }
};
