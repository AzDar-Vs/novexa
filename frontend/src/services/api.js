import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ==============================
   REQUEST INTERCEPTOR
================================ */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (!response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status, data } = response;

    switch (status) {
      case 401:
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Session expired. Please login again.');
        break;

      case 403:
        toast.error('You do not have permission to access this resource.');
        break;

      case 404:
        toast.error('Requested data not found.');
        break;

      case 422:
        if (Array.isArray(data?.errors)) {
          data.errors.forEach((err) =>
            toast.error(err.msg || 'Validation error')
          );
        } else {
          toast.error(data?.message || 'Validation error');
        }
        break;

      case 500:
        toast.error('Internal server error. Please try again later.');
        break;

      default:
        toast.error(data?.message || 'Something went wrong.');
    }

    return Promise.reject(error);
  }
);

export default api;
