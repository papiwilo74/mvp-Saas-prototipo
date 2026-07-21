import { useQuery } from '@tanstack/react-query';

/**
 * Genera una query key consistente para React Query.
 * @param {string} base - Nombre base (ej: 'menu', 'orders')
 * @param {...string} parts - Partes adicionales de la key
 * @returns {string[]}
 */
export function apiQueryKey(base, ...parts) {
  return [base, ...parts.filter(Boolean)];
}

/**
 * Hook canonico para queries de API.
 *
 * Convenciones:
 * - staleTime: 5 minutos por defecto (los datos de menu/productos no cambian a cada rato)
 * - retry: 1 reintento (errores de red ocasionales)
 * - Usa apiQueryKey para las keys
 *
 * @param {string|string[]} key - Query key (usa apiQueryKey)
 * @param {Function} queryFn - Funcion que retorna data (usa el cliente api)
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {{ data, isLoading, isError, error, refetch, isEmpty }}
 */
export function useApiQuery(key, queryFn, options = {}) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    ...options,
  });

  return {
    data,
    isLoading,
    isError,
    error: isError ? extractErrorMessage(error) : null,
    refetch,
    isEmpty: !isLoading && !isError && isEmpty(data),
  };
}

function extractErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'Error al cargar datos';
}

function isEmpty(data) {
  if (data === null || data === undefined) return true;
  if (Array.isArray(data)) return data.length === 0;
  return false;
}
