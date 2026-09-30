const RESERVED_PATHS = new Set([
  'saas', 'registro', 'register', 'registro-restaurante', 'registro-negocio', 'registro-cliente',
  'menu', 'cart', 'admin', 'superadmin', 'login', 'checkout', 'profile', 'orders',
  'products', 'terms', 'privacy', 'verify-email', 'verificar-email', 'forgot-password', 'reset-password',
  'icons', 'assets', 'sw.js', 'manifest.json', 'favicon.ico'
]);

export function getRestaurantSlug() {
  if (typeof window === 'undefined') return import.meta.env.VITE_RESTAURANT_SLUG || 'demo-burger';

  const { pathname, search } = window.location;

  const params = new URLSearchParams(search);
  const fromQuery = params.get('restaurant');
  if (fromQuery) {
    try {
      sessionStorage.setItem('active_restaurant_slug', fromQuery);
      localStorage.setItem('active_restaurant_slug', fromQuery);
    } catch {
      // ignore storage errors
    }
    return fromQuery;
  }

  const pathParts = pathname.replace(/^\/+|\/+$/g, '').split('/');
  const pathSlug = pathParts[0];
  if (pathSlug && !RESERVED_PATHS.has(pathSlug.toLowerCase()) && !pathSlug.includes('.')) {
    try {
      sessionStorage.setItem('active_restaurant_slug', pathSlug);
      localStorage.setItem('active_restaurant_slug', pathSlug);
    } catch {
      // ignore storage errors
    }
    return pathSlug;
  }

  try {
    const stored = sessionStorage.getItem('active_restaurant_slug') || localStorage.getItem('active_restaurant_slug');
    if (stored) return stored;
  } catch {
    // ignore storage errors
  }

  return import.meta.env.VITE_RESTAURANT_SLUG || 'demo-burger';
}

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL?.startsWith('https://')) {
    return import.meta.env.VITE_API_URL.replace(/\/api$/, '');
  }
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:4000`;
  }
  return 'https://mvp-saas-prototipo.onrender.com';
};

export const env = {
  apiUrl: import.meta.env.VITE_API_URL?.startsWith('https://')
    ? import.meta.env.VITE_API_URL
    : '/api',
  socketUrl: getSocketUrl(),
  get restaurantSlug() {
    return getRestaurantSlug();
  },
  enableOrderHistory: import.meta.env.VITE_ENABLE_ORDER_HISTORY !== 'false',
  get demoMode() {
    return import.meta.env.VITE_DEMO_MODE === 'true' || getRestaurantSlug().includes('demo');
  }
};
