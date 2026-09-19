import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { env } from '../config/env';
import { api } from '../services/api';
import { apiQueryKey } from '../hooks/useApiQuery';
import { getBusinessLabels } from '../utils/businessLabels';
import { useAuth } from './AuthContext';

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
  businessType: 'restaurant',
  businessLabel: 'restaurante',
  catalogLabel: 'Menú',
  orderLabel: 'pedido',
  productLabel: 'producto',
  fulfillmentLabel: 'domicilio',
  showTableNumber: true,
  showKitchenPanel: true,
  businessHours: null,
  acceptsScheduledOrders: false,
  leadTimeMinutes: 30,
  deliveryFee: 0,
  deliveryZones: [],
  coupons: [],
  paymentMethods: ['CASH', 'NEQUI', 'CARD']
};

const RestaurantConfigContext = createContext(null);

function normalizeConfig(config) {
  return {
    ...fallbackConfig,
    ...(config || {})
  };
}

export function RestaurantConfigProvider({ children }) {
  const queryClient = useQueryClient();
  const auth = useAuth();
  const user = auth?.user;

  // Determinar el slug activo con prioridad:
  // 1. ?restaurant=slug en URL
  // 2. user.restaurantSlug si el usuario es administrador de un restaurante
  // 3. env.restaurantSlug
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const fromQuery = searchParams?.get('restaurant');
  const activeSlug = fromQuery || user?.restaurantSlug || env.restaurantSlug;

  const { data, isLoading, isError } = useQuery({
    queryKey: apiQueryKey('restaurantConfig', activeSlug),
    queryFn: async () => {
      const { data } = await api.get('/restaurant-config', { params: { restaurant: activeSlug } });
      return normalizeConfig(data.restaurant?.config || data.config || data);
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
    placeholderData: fallbackConfig,
  });

  const config = normalizeConfig(data);
  const labels = useMemo(() => getBusinessLabels(config), [config]);

  const setConfig = useCallback((newConfig) => {
    queryClient.setQueryData(apiQueryKey('restaurantConfig', activeSlug), normalizeConfig(newConfig));
  }, [queryClient, activeSlug]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', config.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', config.secondaryColor);
  }, [config]);

  const value = useMemo(() => ({
    config,
    labels,
    setConfig,
    activeSlug,
    loading: isLoading && !data,
    isError
  }), [config, labels, setConfig, activeSlug, isLoading, isError, data]);

  return <RestaurantConfigContext.Provider value={value}>{children}</RestaurantConfigContext.Provider>;
}

export const useRestaurantConfig = () => useContext(RestaurantConfigContext);
