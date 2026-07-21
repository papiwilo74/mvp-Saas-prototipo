import { useMemo } from 'react';
import { env } from '../config/env';
import { api } from '../services/api';
import { useApiQuery, apiQueryKey } from './useApiQuery';

export function useMenu() {
  const { data, isLoading, isError, error } = useApiQuery(
    apiQueryKey('menu', env.restaurantSlug),
    async () => {
      const { data } = await api.get('/menu', { params: { restaurant: env.restaurantSlug } });
      return data.restaurant;
    }
  );

  const products = useMemo(
    () => data?.categories?.flatMap((cat) => cat.products.map((p) => ({ ...p, category: cat }))) || [],
    [data]
  );

  return {
    restaurant: data,
    categories: data?.categories || [],
    products,
    loading: isLoading,
    error: error || '',
    isError,
  };
}
