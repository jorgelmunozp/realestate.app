import { useState, useEffect } from "react";
import { api } from "../services/api/api";

export const useFetchGet = (apiUrl) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(apiUrl));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!apiUrl) return;     // No se ejecuta si la URL no está definida

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(apiUrl);
        setData(response.data);
      } catch (err) {
        console.error("Error en useFetchGet:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  return { data, loading, error };
};
