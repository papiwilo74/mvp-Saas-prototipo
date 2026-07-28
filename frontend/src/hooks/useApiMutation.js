import { useMutation } from '@tanstack/react-query';

export function useApiMutation(mutationFn, options = {}) {
  return useMutation({
    mutationFn,
    ...options
  });
}
