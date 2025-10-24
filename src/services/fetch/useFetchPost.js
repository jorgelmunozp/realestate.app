import { useState } from "react";
import { api } from "../services/api/api";

export const useFetchPost = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const postData = async (apiUrl, body) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(apiUrl, body);
      setData(response.data);
      return response.data;
    } catch (err) {
      console.error("Error en useFetchPost:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, postData };
};