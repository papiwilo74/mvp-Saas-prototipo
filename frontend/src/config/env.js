function getRestaurantSlug() {
  if (typeof window === 'undefined') return 'demo-burger';

  const { pathname, search, hostname } = window.location;

  const params = new URLSearchParams(search);
  const fromQuery = params.get('restaurant');
  if (fromQuery) {
    sessionStorage.setItem('ff_restaurant_slug', fromQuery);
    return fromQuery;
  }

  const stored = sessionStorage.getItem('ff_restaurant_slug');
  if (stored) return stored;

  const reservedPaths = ['menu', 'cart', 'admin', 'superadmin', 'login', 'checkout', 'profile', 'orders', 'products', 'icons', 'assets', 'sw.js', 'manifest.json', 'favicon.ico'];
  const pathSlug = pathname.replace(/^\/+|\/+$/g, '');
  if (pathSlug && !reservedPaths.includes(pathSlug) && !pathSlug.includes('/') && !pathSlug.includes('.')) {
    sessionStorage.setItem('ff_restaurant_slug', pathSlug);
    return pathSlug;
  }

  return import.meta.env.VITE_RESTAURANT_SLUG || 'demo-burger';
}

export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  restaurantSlug: getRestaurantSlug(),
  enableOrderHistory: import.meta.env.VITE_ENABLE_ORDER_HISTORY !== 'false'
};
