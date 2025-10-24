import { useState } from "react";
import { api } from "../services/api/api";

export const useFetchPatch = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const patchData = async (apiUrl, body) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch(apiUrl, body);
      setData(response.data);
      return response.data;
    } catch (err) {
      console.error("Error en useFetchPatch:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, patchData };
};