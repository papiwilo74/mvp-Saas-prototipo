import axios from 'axios';
import { env } from '../config/env';

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ff_token');
    }
    return Promise.reject(error);
  }
);
