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
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        await axios.post(`${env.apiUrl}/auth/refresh`, {}, { withCredentials: true });
        return api(error.config);
      } catch {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);