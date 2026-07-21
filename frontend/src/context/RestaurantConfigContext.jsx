import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useMemo } from 'react';
import { env } from '../config/env';
import { api } from '../services/api';
import { apiQueryKey } from '../hooks/useApiQuery';

const fallbackConfig = {
  restaurantName: 'Demo Burger',
  logoUrl: '',
  primaryColor: '#ea580c',
  secondaryColor: '#18181b',
  phone: '+57 300 000 0000',
  whatsapp: '+573000000000',
  address: 'Calle Principal 123',
  email: 'hola@demoburger.com',
  facebookUrl: '',
  instagramUrl: '',
  openingHours: 'Lunes a domingo: 11:00 a.m. - 10:00 p.m.',
  businessHours: null,
  acceptsScheduledOrders: false,
  leadTimeMinutes: 30,
  deliveryFee: 0,
  deliveryZones: [],
  coupons: [],
  paymentMethods: ['CASH', 'NEQUI', 'CARD']
};

const RestaurantConfigContext = createContext(null);

export function RestaurantConfigProvider({ children }) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: apiQueryKey('restaurantConfig', env.restaurantSlug),
    queryFn: async () => {
      const { data } = await api.get('/restaurant-config', { params: { restaurant: env.restaurantSlug } });
      return data.restaurant.config || fallbackConfig;
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
    placeholderData: fallbackConfig,
  });

  const config = data || fallbackConfig;

  const setConfig = (newConfig) => {
    queryClient.setQueryData(apiQueryKey('restaurantConfig', env.restaurantSlug), newConfig);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', config.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', config.secondaryColor);
  }, [config]);

  const value = useMemo(() => ({
    config,
    setConfig,
    loading: isLoading && !data,
    isError
  }), [config, isLoading, isError, data]);

  return <RestaurantConfigContext.Provider value={value}>{children}</RestaurantConfigContext.Provider>;
}

export const useRestaurantConfig = () => useContext(RestaurantConfigContext);

