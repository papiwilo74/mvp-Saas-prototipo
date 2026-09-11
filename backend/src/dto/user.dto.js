export const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  restaurantId: user.restaurantId,
  restaurantSlug: user.restaurant?.slug || user.restaurantSlug || null
});
