import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { env } from '../config/env';
import { api } from '../services/api';

export function useMenu() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['menu', env.restaurantSlug],
    queryFn: async () => {
      const { data } = await api.get('/menu', { params: { restaurant: env.restaurantSlug } });
      return data.restaurant;
    },
    staleTime: 5 * 60 * 1000
  });

  const products = useMemo(
    () => data?.categories.flatMap((category) => category.products.map((product) => ({ ...product, category }))) || [],
    [data]
  );

  return {
    restaurant: data,
    categories: data?.categories || [],
    products,
    loading: isLoading,
    error: error ? 'No pudimos cargar el menu en este momento.' : ''
  };
}
