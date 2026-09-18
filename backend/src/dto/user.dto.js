export const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  restaurantId: user.restaurantId,
  restaurantName: user.restaurant?.name || null,
  restaurantSlug: user.restaurant?.slug || user.restaurantSlug || null,
  restaurantCreatedAt: user.restaurant?.createdAt || null
});

