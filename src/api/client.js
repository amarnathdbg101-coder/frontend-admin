import axios from 'axios';

const rawUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
export const API_BASE_URL = rawUrl ? rawUrl.replace(/\/+$/, '') : 'https://api.shopsilo.in';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token automatically
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopsilo_admin_token') || localStorage.getItem('shopme_admin_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize API responses & handle 401
client.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const backendMessage = error.response?.data?.error || error.response?.data?.message;
    const fallbackMessage = error.message || 'Something went wrong, please try again';

    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('shopsilo_admin_token');
      localStorage.removeItem('shopme_admin_token');
      localStorage.removeItem('shopsilo_admin_user');
      localStorage.removeItem('shopme_admin_user');
      window.dispatchEvent(new Event('shopsilo_admin_unauthorized'));
    }

    return Promise.reject(new Error(backendMessage || fallbackMessage));
  }
);

export default client;

export const apiClient = client;
