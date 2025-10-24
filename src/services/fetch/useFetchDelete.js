import { useState } from "react";
import { api } from "../services/api/api";

export const useFetchDelete = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteData = async (apiUrl) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(apiUrl);
      setData(response.data);
      return response.data;
    } catch (err) {
      console.error("Error en useFetchDelete:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, deleteData };
};