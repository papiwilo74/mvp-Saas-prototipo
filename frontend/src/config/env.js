function getRestaurantSlug() {
  if (typeof window === 'undefined') return import.meta.env.VITE_RESTAURANT_SLUG || 'demo-burger';

  const { pathname, search } = window.location;

  const params = new URLSearchParams(search);
  const fromQuery = params.get('restaurant');
  if (fromQuery) return fromQuery;

  const reservedPaths = ['menu', 'cart', 'admin', 'superadmin', 'login', 'checkout', 'profile', 'orders', 'products', 'icons', 'assets', 'sw.js', 'manifest.json', 'favicon.ico'];
  const pathSlug = pathname.replace(/^\/+|\/+$/g, '');
  if (pathSlug && !reservedPaths.includes(pathSlug) && !pathSlug.includes('/') && !pathSlug.includes('.')) {
    return pathSlug;
  }

  return import.meta.env.VITE_RESTAURANT_SLUG || 'demo-burger';
}

const restaurantSlug = getRestaurantSlug();

export const env = {
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  restaurantSlug,
  enableOrderHistory: import.meta.env.VITE_ENABLE_ORDER_HISTORY !== 'false',
  demoMode: import.meta.env.VITE_DEMO_MODE === 'true' || restaurantSlug.includes('demo')
};
