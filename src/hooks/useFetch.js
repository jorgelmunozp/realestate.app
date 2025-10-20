import { useState, useEffect } from "react";
import { api } from "../services/api";

export const useFetch = (url, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState(null);

  useEffect(() => {
    // 🚫 No ejecutar si la URL no está definida
    if (!url) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(url);
        setData(response.data);
      } catch (err) {
        console.error("Error en useFetch:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, deps);

  return { data, loading, error };
};
