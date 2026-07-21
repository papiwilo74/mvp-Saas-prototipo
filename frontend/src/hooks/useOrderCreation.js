import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

/**
 * Hook para crear pedidos via API.
 * Invalida caches de menu y orders tras exito.
 *
 * @param {Object} options
 * @param {Function} [options.onSuccess] - Callback tras creacion exitosa
 * @param {Function} [options.onError] - Callback con mensaje de error legible
 * @returns {UseMutationResult}
 */
export function useOrderCreation({ onSuccess, onError } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/orders', payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error.response?.data?.message || 'No pudimos crear el pedido.');
    },
  });
}
