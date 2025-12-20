import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const url = config.url || '';
  
  const isPublicEndpoint = 
    url.includes('/api/auth/register') || 
    url.includes('/api/auth/login') ||
    url.includes('/auth/register') || 
    url.includes('/auth/login') ||
    url.endsWith('/auth/register') ||
    url.endsWith('/auth/login');
  
  if (isPublicEndpoint) {
    if (config.headers) {
      delete config.headers.Authorization;
      delete config.headers.authorization;
    }
  } else {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

