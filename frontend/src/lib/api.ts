import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
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
