function getRestaurantSlug() {
  if (typeof window === 'undefined') {
    return 'demo-burger';
  }

  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('restaurant');
  if (fromUrl) {
    sessionStorage.setItem('ff_restaurant_slug', fromUrl);
    return fromUrl;
  }

  const stored = sessionStorage.getItem('ff_restaurant_slug');
  if (stored) return stored;

  return import.meta.env.VITE_RESTAURANT_SLUG || 'demo-burger';
}

export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  restaurantSlug: getRestaurantSlug(),
  enableOrderHistory: import.meta.env.VITE_ENABLE_ORDER_HISTORY !== 'false'
};
