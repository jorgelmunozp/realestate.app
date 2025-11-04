// export const getBaseURL = () => {
//   const env = process.env.REACT_APP_BACKEND_URL.trim();
//   if (env && env !== 'undefined' && env !== 'null') return env;
//   try {
//     // Permite inyectar base en window en despliegues estáticos
//     if (typeof window !== 'undefined' && window.__API_BASE__) return window.__API_BASE__;
//   } catch (_) {}
//   // Fallback: relativo al mismo origen (útil si hay proxy /api)
//   return '';
// };


export const getBaseURL = () => {
  const env = process.env.REACT_APP_BACKEND_URL.trim();
  if (env && env !== "undefined" && env !== "null") return env.replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.__API_BASE__) return window.__API_BASE__.replace(/\/+$/, "");
  return "";
};

