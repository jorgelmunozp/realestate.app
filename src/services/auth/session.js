import axios from 'axios';
import { getToken, getTokenPayload, isTokenNearExpiry, saveToken, clearToken } from './token';
import { store } from '../store/store';
import { logout } from '../store/authSlice';

let refreshPromise = null;

const getRefreshEndpoint = () => process.env.REACT_APP_ENDPOINT_REFRESH || '/api/auth/refresh';

const redirectToLogin = () => {
  try {
    const here = window.location?.pathname + window.location?.search;
    if (here && !here.startsWith('/login')) {
      sessionStorage.setItem('lastPath', here);
    }
    // asegurar estado redux limpio
    try { store.dispatch(logout()); } catch (_) {}
    window.location.replace('/login');
  } catch (_) {
    // noop
  }
};

export const refreshToken = async () => {
  if (refreshPromise) return refreshPromise;

  const endpoint = getRefreshEndpoint();
  if (!endpoint) return null;

  const baseURL = process.env.REACT_APP_BACKEND_URL;
  const currentToken = getToken('token');
  if (!currentToken) return null;

  const client = axios.create({ baseURL, timeout: 15000, withCredentials: true });

  refreshPromise = client
    .post(endpoint, {}, { headers: { Authorization: `Bearer ${currentToken}` } })
    .then((res) => {
      const newToken = res?.data?.token || res?.data?.accessToken || null;
      if (newToken) {
        saveToken(newToken);
      }
      return newToken;
    })
    .catch((err) => {
      clearToken();
      try { store.dispatch(logout()); } catch (_) {}
      redirectToLogin();
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

export const ensureFreshToken = async (skewSeconds = 60) => {
  const payload = getTokenPayload('token');
  if (!payload) return null;
  if (isTokenNearExpiry(payload, skewSeconds)) {
    try {
      return await refreshToken();
    } catch (_) {
      return null;
    }
  }
  return getToken('token');
};

export const installAuthInterceptors = (api) => {
  // Proactive refresh before requests
  api.interceptors.request.use(async (config) => {
    if (config.__skipAuth) return config; // allow bypass
    try {
      await ensureFreshToken();
    } catch (_) {}
    return config;
  });

  // On 401, attempt single refresh and retry
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
        } catch (_) {
          // fallthrough to reject
        }
      }
      if (error?.response?.status === 401) {
        try { store.dispatch(logout()); } catch (_) {}
        redirectToLogin();
      }
      return Promise.reject(error);
    }
  );
};
