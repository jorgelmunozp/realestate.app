export const getBaseURL = () => {
  const env = process.env.REACT_APP_BACKEND_URL;
  if (env && env !== "undefined" && env !== "null") return env.replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.__API_BASE__) return window.__API_BASE__.replace(/\/+$/, "");
  return "";
};

