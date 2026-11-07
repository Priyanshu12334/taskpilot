import axios from 'axios';

const configuredApiUrl =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : import.meta.env.VITE_API_URL || 'https://taskpilot-server.onrender.com';
const API = configuredApiUrl.replace(/\/+$/, '').replace(/\/api$/i, '');

const api = axios.create({
  baseURL: API + '/api',
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed?.token) config.headers.Authorization = `Bearer ${parsed.token}`;
      } catch {
        // Ignore malformed session data; authorization errors are handled below.
      }
    }

    // Prevent stale cached authorization responses.
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers.Pragma = 'no-cache';
    return config;
  },
  (error) => Promise.reject(error)
);

let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response?.status === 401 && !isRedirecting) {
      const isPublicRoute = ['/login', '/register', '/'].includes(window.location.pathname);
      localStorage.removeItem('userInfo');
      if (!isPublicRoute) {
        isRedirecting = true;
        window.location.href = '/login?reason=expired';
      }
    }

    if (response?.status === 403) {
      const data = response.data;
      const isBlocked = data.errorCode === 'ACCOUNT_BLOCKED'
        || data.message?.toLowerCase().includes('blocked');

      if (isBlocked && !isRedirecting) {
        isRedirecting = true;
        localStorage.removeItem('userInfo');
        window.location.href = '/login?reason=blocked';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
