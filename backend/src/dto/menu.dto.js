export const toProductSummary = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  imageUrl: product.imageUrl,
  isAvailable: product.isAvailable,
  trackStock: product.trackStock,
  stock: product.stock,
  images: product.images || []
});

export const toCategoryResponse = (category) => ({
  id: category.id,
  name: category.name,
  sortOrder: category.sortOrder,
  products: category.products?.map(toProductSummary) || []
});

export const toMenuResponse = (restaurant) => ({
  id: restaurant.id,
  name: restaurant.name,
  slug: restaurant.slug,
  categories: restaurant.categories?.map(toCategoryResponse) || [],
  config: restaurant.config ? {
    acceptsScheduledOrders: restaurant.config.acceptsScheduledOrders,
    leadTimeMinutes: restaurant.config.leadTimeMinutes,
    deliveryFee: restaurant.config.deliveryFee,
    deliveryZones: restaurant.config.deliveryZones,
    loyaltyProgram: restaurant.config.loyaltyProgram,
    coupons: restaurant.config.coupons
  } : null
});
