import axios from 'axios';
import { env } from '../config/env';

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrf-token');
  if (csrfToken) {
    config.headers['x-csrf-token'] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Escudo para cuando el servidor backend esté completamente caído, offline o con timeout
    if (!error.response) {
      error.message = 'No se pudo conectar con el servidor. Por favor verifica tu conexión o intenta más tarde.';
      return Promise.reject(error);
    }

    // Prevención estricta de "infinite loop" excluyendo específicamente /login y /refresh de los reintentos
    const isAuthRoute = error.config.url?.includes('/auth/login') || error.config.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !error.config._retry && !isAuthRoute) {
      error.config._retry = true;
      try {
        await axios.post(`${env.apiUrl}/auth/refresh`, {}, { withCredentials: true });
        return api(error.config); // Reintentar la llamada original si refrescó exitosamente
      } catch {
        // Redirigir a login solo si no está actualmente en la vista de login para evitar recargas infinitas
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);
