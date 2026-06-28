import { useEffect, useMemo, useState } from 'react';
import { env } from '../config/env';
import { api } from '../services/api';

export function useMenu() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cacheKey = `ff_menu_${env.restaurantSlug}`;
    const cachedValue = sessionStorage.getItem(cacheKey);

    if (cachedValue) {
      try {
        setRestaurant(JSON.parse(cachedValue));
        setLoading(false);
      } catch {
        sessionStorage.removeItem(cacheKey);
      }
    }

    api
      .get('/menu', { params: { restaurant: env.restaurantSlug } })
      .then(({ data }) => {
        setRestaurant(data.restaurant);
        sessionStorage.setItem(cacheKey, JSON.stringify(data.restaurant));
        setError('');
      })
      .catch(() => {
        setError('No pudimos cargar el menu en este momento.');
      })
      .finally(() => setLoading(false));
  }, []);

  const products = useMemo(
    () => restaurant?.categories.flatMap((category) => category.products.map((product) => ({ ...product, category }))) || [],
    [restaurant]
  );

  return { restaurant, categories: restaurant?.categories || [], products, loading, error };
}

