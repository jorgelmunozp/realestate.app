import axios from "axios";
import { installAuthInterceptors } from "../auth/session";
import { getBaseURL } from "./config";

// Instancia global de Axios
export const api = axios.create({
  baseURL: getBaseURL(),          // Toma automáticamente REACT_APP_API_BASE_URL del .env
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

// Interceptores de autenticación
installAuthInterceptors(api); // Instala lógica de auto-refresh

export default api;
