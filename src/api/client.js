import axios from 'axios';

const DEFAULT_PROD_API = 'https://shopsiloapi.shopsilo.in';
const DEFAULT_LOCAL_API = 'http://localhost:8080';

// Smart API URL Resolver:
// If running on localhost/127.0.0.1, prioritize local GoBackend (or configured local URL).
// In production, use https://shopsiloapi.shopsilo.in.
const resolveInitialBaseUrl = () => {
  let envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (envUrl && envUrl.includes('api.shopsilo.in')) {
    envUrl = ''; // Sanitize legacy non-existent domain
  }

  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '0.0.0.0';
    if (isLocalhost) {
      return envUrl || DEFAULT_LOCAL_API;
    }
  }

  return envUrl || DEFAULT_PROD_API;
};

export const API_BASE_URL = resolveInitialBaseUrl().replace(/\/+$/, '');

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

// Response Interceptor: Standardize API responses, dual-target retry, & handle 401
client.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const isNetworkError = !error.response && (
      error.code === 'ERR_NETWORK' || 
      error.code === 'ECONNABORTED' ||
      (typeof error.message === 'string' && error.message.toLowerCase().includes('network error'))
    );

    // Resilient Dual-Target Failover:
    // If local backend is down while on localhost, seamlessly try remote production API (or vice versa).
    if (isNetworkError && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const currentBase = originalRequest.baseURL || API_BASE_URL;
      const fallbackUrl = currentBase.includes('localhost') || currentBase.includes('127.0.0.1')
        ? DEFAULT_PROD_API
        : DEFAULT_LOCAL_API;

      console.warn(`[ShopSilo Admin API] Request to ${currentBase} failed with Network Error. Attempting failover to ${fallbackUrl}...`);
      originalRequest.baseURL = fallbackUrl;

      try {
        const retryRes = await axios(originalRequest);
        return retryRes.data;
      } catch (retryErr) {
        error = retryErr;
      }
    }

    const backendMessage = error.response?.data?.error || error.response?.data?.message;
    const isStillNetworkError = !error.response && (
      error.code === 'ERR_NETWORK' || 
      (typeof error.message === 'string' && error.message.toLowerCase().includes('network error'))
    );

    let displayMessage = backendMessage;
    if (!displayMessage) {
      if (isStillNetworkError) {
        displayMessage = `Unable to connect to backend server (${originalRequest?.baseURL || API_BASE_URL}). Please verify that GoBackend is running on port 8080 or check your internet connection.`;
      } else {
        displayMessage = error.message || 'Something went wrong, please try again.';
      }
    }

    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('shopsilo_admin_token');
      localStorage.removeItem('shopme_admin_token');
      localStorage.removeItem('shopsilo_admin_user');
      localStorage.removeItem('shopme_admin_user');
      window.dispatchEvent(new Event('shopsilo_admin_unauthorized'));
    }

    return Promise.reject(new Error(displayMessage));
  }
);

export default client;
export const apiClient = client;
