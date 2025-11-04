import axios from "axios";
import { getBaseURL } from "../api/config";
import { store } from "../store/store";
import { logout, setAuth } from "../store/authSlice";
import { getToken, getTokenPayload, isTokenNearExpiry, saveToken, clearToken } from "./token";

// referencia al refresh en curso para no disparar varios a la vez
let refreshPromise = null;
// almacena los ids de los interceptores por instancia de axios
const interceptorMap = new WeakMap();

// obtiene el endpoint de refresh desde las envs
const getRefreshEndpoint = () => process.env.REACT_APP_ENDPOINT_TOKEN_REFRESH.trim();

// limpia sesión y redirige al login
const redirectToLogin = () => {
  try {
    // guarda la ruta actual para volver después
    const here = (window.location?.pathname || "") + (window.location?.search || "");
    if (here && !here.startsWith("/login")) sessionStorage.setItem("lastPath", here);
  } catch {}
  try { store.dispatch(logout()); } catch {}
  clearToken();
  try { window.location.replace("/login"); } catch {}
};

// decodifica un JWT sin verificarlo
const decodeJwt = (token) => {
  try {
    const payload = token.split(".")[1] || "";
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// intenta refrescar el token actual
export const refreshToken = async () => {
  // si ya hay un refresh en progreso, reusar esa promesa
  if (refreshPromise) return refreshPromise;

  const endpoint = getRefreshEndpoint();
  const baseURL = getBaseURL();
  const currentToken = getToken("token");
  // si no hay endpoint o no hay token, no se puede refrescar
  if (!endpoint || !currentToken) return null;

  // cliente aislado solo para el refresh
  const client = axios.create({ baseURL, timeout: 15000 });

  // guardamos la promesa para que otros llamados la esperen
  refreshPromise = client
    .post(endpoint, {}, { headers: { Authorization: `Bearer ${currentToken}` } })
    .then((res) => {
      // soporta varias formas de respuesta
      const newToken =
        res?.data?.token ??
        res?.data?.accessToken ??
        res?.data?.data?.accessToken ??
        null;
      if (newToken) {
        // guarda el nuevo token en storage
        saveToken(newToken);
        // decodifica usuario desde el token (opcional)
        const userFromToken = decodeJwt(newToken);
        // actualiza redux con el nuevo token
        store.dispatch(setAuth({ token: newToken, user: userFromToken || undefined }));
      }
      return newToken;
    })
    .catch((err) => {
      // si falló el refresh, limpiamos y mandamos a login
      clearToken();
      try { store.dispatch(logout()); } catch {}
      redirectToLogin();
      throw err;
    })
    .finally(() => {
      // libera la referencia para permitir otro refresh después
      refreshPromise = null;
    });

  return refreshPromise;
};

// asegura que haya un token no vencido antes de usarlo
export const ensureFreshToken = async (skewSeconds = 60) => {
  const payload = getTokenPayload("token");
  if (!payload) return null;
  // si está por expirar, lo refrescamos
  if (isTokenNearExpiry(payload, skewSeconds)) {
    try { return await refreshToken(); } catch { return null; }
  }
  // si no, devolvemos el actual
  return getToken("token");
};

// instala interceptores en una instancia de axios
export const installAuthInterceptors = (api) => {
  if (!api) return null;

  // evita instalar dos veces en la misma instancia
  const existing = interceptorMap.get(api);
  if (existing) return existing;

  // interceptor de request: inyecta el token
  const reqId = api.interceptors.request.use(async (config) => {
    // permite saltarse auth en requests puntuales
    if (config.__skipAuth) return config;
    try {
      // intenta refrescar si es necesario
      await ensureFreshToken();
      const token = getToken("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  });

  // interceptor de response: reintenta si el token estaba vencido
  const resId = api.interceptors.response.use(
    (resp) => resp,
    async (error) => {
      const original = error?.config || {};
      // si es 401 y no hemos reintentado, intentamos refrescar una vez
      if (error?.response?.status === 401 && !original.__retry) {
        original.__retry = true;
        try {
          const newToken = await refreshToken();
          if (newToken) {
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${newToken}`;
            return api(original);
          }
        } catch {}
      }
      // si sigue siendo 401, cerramos sesión y mandamos a login
      if (error?.response?.status === 401) {
        try { store.dispatch(logout()); } catch {}
        redirectToLogin();
      }
      return Promise.reject(error);
    }
  );

  // guardamos los ids para poder desinstalar después
  const ids = { reqId, resId };
  interceptorMap.set(api, ids);
  return ids;
};

// remueve los interceptores de una instancia de axios
export const uninstallAuthInterceptors = (api) => {
  const ids = interceptorMap.get(api);
  if (!ids || !api) return;
  try { api.interceptors.request.eject(ids.reqId); } catch {}
  try { api.interceptors.response.eject(ids.resId); } catch {}
  interceptorMap.delete(api);
};

// helpers para tests
export const __testing = {
  _resetRefresh: () => { refreshPromise = null; },
  _installed: (api) => interceptorMap.get(api),
};
