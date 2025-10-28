import { useState, useEffect } from "react";
import { api } from "../api/api";
import { errorWrapper } from "../api/errorWrapper";

export const useFetch = (apiUrl) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(apiUrl));
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!apiUrl) return; // No ejecutar si la URL no está definida

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await errorWrapper(api.get(apiUrl));
        const { success, data, message, error: errObj } = res;

        if (success && data !== undefined) {
          setData(data);
          setMessage(message || "Datos cargados correctamente");
        } else {
          console.warn(" Error lógico en useFetch:", message, errObj);
          setError(errObj || { message: message || "Error desconocido" });
          setData(null);
        }
      } catch (err) {
        console.error("Error en useFetch:", err);
        setError({ message: err?.message || "Error al obtener datos" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  return { data, loading, error, message };
};
