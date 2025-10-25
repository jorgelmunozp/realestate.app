export const getToken = (key = 'token', storage = sessionStorage) => {
  try {
    return storage.getItem(key) || null;
  } catch (_) {
    return null;
  }
};

export const decodeToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch (_) {
    return null;
  }
};

export const getTokenPayload = (key = 'token') => {
  const token = getToken(key);
  return decodeToken(token);
};

export const getUserFromToken = (payload) => {
  if (!payload || typeof payload !== 'object') return null;
  const getFirst = (keys) => keys.map((k) => payload[k]).find((v) => v != null);

  const id = getFirst(['sub', 'user_id', 'id']);
  const name = getFirst([
    'name',
    'fullName',
    'given_name',
    'username',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  ]);
  const email = getFirst([
    'email',
    'preferred_username',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  ]);
  const role = getFirst([
    'role',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  ]) || (Array.isArray(payload.roles) ? payload.roles[0] : undefined);

  return { id, name, email, role };
};
