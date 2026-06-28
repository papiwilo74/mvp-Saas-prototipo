export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  restaurantSlug: import.meta.env.VITE_RESTAURANT_SLUG || 'demo-burger',
  enableOrderHistory: import.meta.env.VITE_ENABLE_ORDER_HISTORY !== 'false'
};

