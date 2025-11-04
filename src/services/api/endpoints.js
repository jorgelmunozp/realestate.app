const API_BASE = (window.__ENV__?.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL).replace(/\/$/, "");

const qp = (o={}) => {
  const e = Object.entries(o).filter(([,v]) => v !== undefined && v !== null && v !== "");
  return e.length ? `?${new URLSearchParams(e).toString()}` : "";
};

export const endpoints = {
  base: API_BASE,
  auth: {
    login: `${API_BASE}/api/auth/login`,
    register:`${API_BASE}/api/auth/register`,
  },
  user: {
    root: `${API_BASE}/api/user`,
    byId: (id) => `${API_BASE}/api/user/${id}`,
    search: (q)  => `${API_BASE}/api/user${qp(q)}`, // p.ej. { name, email, page, size }
  },
  property: {
    root: `${API_BASE}/api/property`,
    byId: (id) => `${API_BASE}/api/property/${id}`,
    list: (q)  => `${API_BASE}/api/property${qp(q)}`, // { name,address,minPrice,maxPrice,page,size,sort }
  },
  password: {
    recover: `${API_BASE}/api/password/recover`,
    reset: `${API_BASE}/api/password/update`,
  },
  token: {
    generate: `${API_BASE}/api/token/generate`,
    refresh: `${API_BASE}/api/token/refresh`,
  },
};

export default endpoints;
