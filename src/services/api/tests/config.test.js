// ===========================================================
// Obtiene la URL base de la API desde variables de entorno.
// Si no existe, usa el fallback local.
// ===========================================================
export const getBaseURL = () => {
  const envUrl = process.env.REACT_APP_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") return envUrl.trim();
  return "http://localhost:5235/api";
};
