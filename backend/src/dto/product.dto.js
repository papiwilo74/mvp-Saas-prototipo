export const toProductResponse = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  imageUrl: product.imageUrl,
  isAvailable: product.isAvailable,
  trackStock: product.trackStock,
  stock: product.stock,
  categoryId: product.categoryId,
  category: product.category ? {
    id: product.category.id,
    name: product.category.name
  } : null,
  images: product.images || [],
  createdAt: product.createdAt,
  updatedAt: product.updatedAt
});

export const toProductListResponse = (products, pagination) => ({
  products: products.map(toProductResponse),
  pagination
});
