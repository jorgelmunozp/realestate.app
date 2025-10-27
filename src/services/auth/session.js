import axios from "axios";
import { getBaseURL } from "../api/config";
import { store } from "../store/store";
import { logout, login } from "../store/authSlice";
import { getToken, getTokenPayload, isTokenNearExpiry, saveToken, clearToken } from "./token";

let refreshPromise = null;

// ===========================================================
// Utilidades base
// ===========================================================
const getRefreshEndpoint = () => process.env.REACT_APP_ENDPOINT_TOKEN_REFRESH;
const redirectToLogin = () => {
  try {
    const here = window.location?.pathname + window.location?.search;
    if (here && !here.startsWith("/login")) sessionStorage.setItem("lastPath", here);
    try { store.dispatch(logout()); } catch {}
    clearToken();
    window.location.replace("/login");
  } catch {}
};

// ===========================================================
// Lógica de renovación de token (refresh flow)
// ===========================================================
export const refreshToken = async () => {
  if (refreshPromise) return refreshPromise;

  const endpoint = getRefreshEndpoint();
  const baseURL = getBaseURL();
  const currentToken = getToken("token");
  if (!endpoint || !currentToken) return null;

  const client = axios.create({ baseURL, timeout: 15000 });
  refreshPromise = client
    .post(endpoint, {}, { headers: { Authorization: `Bearer ${currentToken}` } })
    .then((res) => {
      const newToken =
        res?.data?.token ||
        res?.data?.accessToken ||
        res?.data?.data?.accessToken ||
        null;

      if (newToken) {
        saveToken(newToken);
        const state = store.getState();
        const user = state?.auth?.user || {};
        store.dispatch(login({ ...user, token: newToken }));
      }
      return newToken;
    })
    .catch((err) => {
      clearToken();
      try { store.dispatch(logout()); } catch {}
      redirectToLogin();
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

// ===========================================================
// Verifica si el token está por expirar
// ===========================================================
export const ensureFreshToken = async (skewSeconds = 60) => {
  const payload = getTokenPayload("token");
  if (!payload) return null;
  if (isTokenNearExpiry(payload, skewSeconds)) {
    try {
      return await refreshToken();
    } catch {
      return null;
    }
  }
  return getToken("token");
};

// ===========================================================
// Instalar interceptores en Axios (usado por api.js)
// ===========================================================
export const installAuthInterceptors = (api) => {
  // 🟢 1️⃣ Antes de enviar peticiones: refresca si está por expirar
  api.interceptors.request.use(async (config) => {
    if (config.__skipAuth) return config;
    try {
      await ensureFreshToken();
      const token = getToken("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  });

  // 🔴 2️⃣ Maneja errores 401 (token vencido o inválido)
  api.interceptors.response.use(
    (resp) => resp,
    async (error) => {
      const original = error?.config || {};
      if (error?.response?.status === 401 && !original.__retry) {
        original.__retry = true;
        try {
          const newToken = await refreshToken();
          if (newToken) {
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${newToken}`;
            return api(original);
          }
        } catch {
          // Si falla el refresh, caerá al siguiente bloque
        }
      }
      if (error?.response?.status === 401) {
        try { store.dispatch(logout()); } catch {}
        redirectToLogin();
      }
      return Promise.reject(error);
    }
  );
};
