import axios from "axios";
import { installAuthInterceptors } from "../auth/session";
import { getBaseURL } from "./config";
import { store } from "../store/store";

// ===========================================================
// Instancia global de Axios
// ===========================================================
export const api = axios.create({
  baseURL: getBaseURL(), // Toma automáticamente REACT_APP_API_BASE_URL del .env
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

// ===========================================================
// Interceptores de autenticación
// ===========================================================

// 1️⃣ Instalar lógica de auto-refresh (si está implementada)
installAuthInterceptors(api);

// 2️⃣ Interceptor global: agrega token JWT desde Redux o sessionStorage
api.interceptors.request.use(
  (config) => {
    try {
      if (config.__skipAuth) return config; // omitir auth si se pasa flag

      // Intentar obtener token desde el store persistido
      const state = store.getState();
      const tokenFromStore = state?.auth?.token;

      // Fallback: token desde sessionStorage
      const tokenFromSession = sessionStorage.getItem("persist:auth")
        ? JSON.parse(JSON.parse(sessionStorage.getItem("persist:auth"))?.token || "null")
        : null;

      const token = tokenFromStore || tokenFromSession;

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Evita errores si Redux aún no está cargado o storage inaccesible
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
