import { useEffect, useMemo, useState } from 'react';
import { env } from '../config/env';
import { api } from '../services/api';

export function useMenu() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/menu', { params: { restaurant: env.restaurantSlug } })
      .then(({ data }) => setRestaurant(data.restaurant))
      .finally(() => setLoading(false));
  }, []);

  const products = useMemo(
    () => restaurant?.categories.flatMap((category) => category.products.map((product) => ({ ...product, category }))) || [],
    [restaurant]
  );

  return { restaurant, categories: restaurant?.categories || [], products, loading };
}

