import axios from "axios";
import { getBaseURL } from "../api/config";
import { store } from "../store/store";
import { logout, login } from "../store/authSlice";
import { getToken, getTokenPayload, isTokenNearExpiry, saveToken, clearToken } from "./token";

let refreshPromise = null;
const interceptorMap = new WeakMap();

const getRefreshEndpoint = () => process.env.REACT_APP_ENDPOINT_TOKEN_REFRESH;
const redirectToLogin = () => {
  try {
    const here = (window.location?.pathname || "") + (window.location?.search || "");
    if (here && !here.startsWith("/login")) sessionStorage.setItem("lastPath", here);
  } catch {}
  try { store.dispatch(logout()); } catch {}
  clearToken();
  try { window.location.replace("/login"); } catch {}
};

export const refreshToken = async () => {
  if (refreshPromise) return refreshPromise;

  const endpoint = getRefreshEndpoint();
  const baseURL = getBaseURL();
  const currentToken = getToken("token");
  if (!endpoint || !currentToken) return null;

  const client = axios.create({ baseURL, timeout: 15000 });

  refreshPromise = client.post(endpoint, {}, { headers: { Authorization: `Bearer ${currentToken}` } })
    .then((res) => {
      const newToken = res?.data?.token ?? res?.data?.accessToken ?? res?.data?.data?.accessToken ?? null;
      if (newToken) {
        saveToken(newToken);
        const user = store.getState()?.auth?.user || {};
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
    .finally(() => { refreshPromise = null; });

  return refreshPromise;
};

export const ensureFreshToken = async (skewSeconds = 60) => {
  const payload = getTokenPayload("token");
  if (!payload) return null;
  if (isTokenNearExpiry(payload, skewSeconds)) {
    try { return await refreshToken(); } catch { return null; }
  }
  return getToken("token");
};

export const installAuthInterceptors = (api) => {
  if (!api) return null;
  const existing = interceptorMap.get(api);
  if (existing) return existing;

  const reqId = api.interceptors.request.use(async (config) => {
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

  const resId = api.interceptors.response.use(
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
        } catch {}
      }
      if (error?.response?.status === 401) {
        try { store.dispatch(logout()); } catch {}
        redirectToLogin();
      }
      return Promise.reject(error);
    }
  );

  const ids = { reqId, resId };
  interceptorMap.set(api, ids);
  return ids;
};

export const uninstallAuthInterceptors = (api) => {
  const ids = interceptorMap.get(api);
  if (!ids || !api) return;
  try { api.interceptors.request.eject(ids.reqId); } catch {}
  try { api.interceptors.response.eject(ids.resId); } catch {}
  interceptorMap.delete(api);
};

// Opcional para tests
export const __testing = {
  _resetRefresh: () => { refreshPromise = null; },
  _installed: (api) => interceptorMap.get(api)
};
