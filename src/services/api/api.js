import axios from 'axios';
import { installAuthInterceptors } from '../auth/session';

export const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL, // URL del backend
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-renew and 401-retry logic (instalar primero)
installAuthInterceptors(api);

// Interceptor global: agrega token de sesión si existe (después de refresh)
api.interceptors.request.use(
  (config) => {
    try {
      if (config.__skipAuth) return config; // permitir omitir auth en llamadas internas
      const token = sessionStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {
      // sessionStorage puede no estar disponible en algunos contextos
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
