import { useState } from 'react';

const useApi = (apiFunc) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFunc(...args);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { request, loading, error };
};

export default useApi;
