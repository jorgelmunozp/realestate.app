import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL, // URL del backend
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor global: agrega token de sesión si existe
api.interceptors.request.use(
  (config) => {
    try {
      const token = sessionStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {
      // sessionStorage puede no estar disponible en algunos contextos de ejecución
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
