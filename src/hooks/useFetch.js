import { useState, useEffect } from "react";
import { api } from "../services/api";

export const useFetch = (apiUrl) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(apiUrl));
  const [error, setError] = useState(null);

  useEffect(() => {
    // No se ejecuta si la URL no está definida
    if (!apiUrl) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(apiUrl);
        setData(response.data);
      } catch (err) {
        console.error("Error en useFetch:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  return { data, loading, error };
};
