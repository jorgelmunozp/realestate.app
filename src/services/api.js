import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL, // URL del backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
