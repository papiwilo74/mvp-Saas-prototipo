function getRestaurantSlug() {
  if (typeof window === 'undefined') return import.meta.env.VITE_RESTAURANT_SLUG || 'demo-burger';

  const { pathname, search } = window.location;

  const params = new URLSearchParams(search);
  const fromQuery = params.get('restaurant');
  if (fromQuery) return fromQuery;

  const reservedPaths = ['saas', 'registro-restaurante', 'menu', 'cart', 'admin', 'superadmin', 'login', 'checkout', 'profile', 'orders', 'products', 'icons', 'assets', 'sw.js', 'manifest.json', 'favicon.ico'];
  const pathSlug = pathname.replace(/^\/+|\/+$/g, '');
  if (pathSlug && !reservedPaths.includes(pathSlug) && !pathSlug.includes('/') && !pathSlug.includes('.')) {
    return pathSlug;
  }

  return import.meta.env.VITE_RESTAURANT_SLUG || 'demo-burger';
}

const restaurantSlug = getRestaurantSlug();

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL?.startsWith('https://')) {
    return import.meta.env.VITE_API_URL.replace(/\/api$/, '');
  }
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (isLocal) {
    return `${window.location.protocol}//${window.location.hostname}:4000`;
  }
  return 'https://mvp-saas-prototipo.onrender.com';
};

export const env = {
  apiUrl: import.meta.env.VITE_API_URL?.startsWith('https://')
    ? import.meta.env.VITE_API_URL
    : '/api',
  socketUrl: getSocketUrl(),
  restaurantSlug,
  enableOrderHistory: import.meta.env.VITE_ENABLE_ORDER_HISTORY !== 'false',
  demoMode: import.meta.env.VITE_DEMO_MODE === 'true' || restaurantSlug.includes('demo')
};
