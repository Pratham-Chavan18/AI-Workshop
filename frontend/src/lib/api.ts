import axios from 'axios';

const resolveApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (url) return url;

  if (import.meta.env.DEV) {
    return 'http://localhost:4000/api/v1';
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return '/api/v1';
  }

  throw new Error(
    'Missing VITE_API_URL environment variable. Please configure VITE_API_URL in your client environment.'
  );
};

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage = error.response?.data?.error?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(customMessage));
  }
);

export default api;
