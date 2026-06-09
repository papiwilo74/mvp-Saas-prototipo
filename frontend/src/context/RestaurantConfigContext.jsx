import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { env } from '../config/env';
import { api } from '../services/api';

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
  instagramUrl: ''
};

const RestaurantConfigContext = createContext(null);

export function RestaurantConfigProvider({ children }) {
  const [config, setConfig] = useState(fallbackConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/restaurant-config', { params: { restaurant: env.restaurantSlug } })
      .then(({ data }) => {
        setConfig(data.restaurant.config || fallbackConfig);
      })
      .catch(() => setConfig(fallbackConfig))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', config.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', config.secondaryColor);
  }, [config]);

  const value = useMemo(() => ({ config, setConfig, loading }), [config, loading]);

  return <RestaurantConfigContext.Provider value={value}>{children}</RestaurantConfigContext.Provider>;
}

export const useRestaurantConfig = () => useContext(RestaurantConfigContext);

