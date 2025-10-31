import axios from "axios";
import { installAuthInterceptors } from "../../auth/session";
import { getBaseURL } from "../config";
import { store } from "../../store/store";

// Instancia global de Axios
export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});


// Interceptores de autenticación
// Interceptores de sesión (auto-refresh, etc.)
installAuthInterceptors(api);

// Agrega token JWT automáticamente
api.interceptors.request.use(
  (config) => {
    try {
      if (config.__skipAuth) return config;

      // Intentar obtener token desde Redux
      const state = store.getState();
      const tokenFromStore = state?.auth?.token;

      // Fallback: persistencia del token en sessionStorage
      const persisted = sessionStorage.getItem("persist:auth");
      let tokenFromSession = null;
      if (persisted) {
        const parsed = JSON.parse(persisted);
        tokenFromSession = JSON.parse(parsed?.token || "null");
      }

      const token = tokenFromStore || tokenFromSession;

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Evita errores si Redux o sessionStorage no están listos
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
