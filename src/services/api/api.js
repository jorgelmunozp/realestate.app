import axios from 'axios';
import { installAuthInterceptors } from '../auth/session';
import { getBaseURL } from './config';

// ===========================================================
// 🔹 Instancia global de Axios
// ===========================================================
export const api = axios.create({
  baseURL: getBaseURL(), // Se toma del .env automáticamente
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// ===========================================================
// 🔹 Interceptores de autenticación
// ===========================================================

// 1️⃣ Instalar lógica de auto-refresh de token (si la tienes implementada)
installAuthInterceptors(api);

// 2️⃣ Interceptor global: agrega token de sesión si existe
api.interceptors.request.use(
  (config) => {
    try {
      if (config.__skipAuth) return config; // permite omitir auth en ciertas llamadas
      const token = sessionStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Silencia errores si sessionStorage no está disponible
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
