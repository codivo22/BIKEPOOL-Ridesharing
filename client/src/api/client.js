import axios from 'axios';

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('bikepool_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getErrorMessage = (error) => error.response?.data?.message || 'Something went wrong. Please try again.';
export default client;
