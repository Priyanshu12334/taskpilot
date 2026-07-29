import axios from 'axios';

const API =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : import.meta.env.VITE_API_URL || "https://taskpilot-server.onrender.com";

const api = axios.create({
  baseURL: API + '/api',
  withCredentials: true,
});

// Interceptor to attach the token automatically to requests
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed && parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
          console.log(`[API Request] 🔑 Token Loaded: ${parsed.token.substring(0, 10)}... | Auth Header: Bearer ${parsed.token.substring(0, 10)}... | URL: ${config.method?.toUpperCase()} ${config.url}`);
        } else {
          console.warn(`[API Request] ⚠️ userInfo in localStorage has no token for URL: ${config.url}`);
        }
      } catch (e) {
        console.error(`[API Request] ❌ Failed to parse userInfo:`, e);
      }
    } else {
      console.warn(`[API Request] ⚠️ No userInfo in localStorage for URL: ${config.url}`);
    }

    // Anti-caching headers for Chrome to prevent stale 401 cached responses
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to handle expired tokens (401) and forced logouts (403)
let isRedirecting = false; // Prevent multiple redirects on concurrent errors

api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ✅ Status: ${response.status} | URL: ${response.config?.url}`);
    return response;
  },
  (error) => {
    const { response, config } = error;
    
    if (response) {
      console.warn(`[API Response Error] ❌ Status: ${response.status} | URL: ${config?.url} | Message:`, response.data?.message || error.message);
      
      // Handle 401 Unauthorized (Expired or Invalid Token)
      if (response.status === 401 && !isRedirecting) {
        const isPublicRoute = window.location.pathname === '/login' || window.location.pathname === '/register' || window.location.pathname === '/';
        
        if (!isPublicRoute) {
          isRedirecting = true;
          console.warn('[API] 🔒 401 Unauthorized detected. Purging invalid token and redirecting...');
          localStorage.removeItem('userInfo');
          window.location.href = '/login?reason=expired';
        } else {
          localStorage.removeItem('userInfo');
        }
      }

      // Handle 403 Forbidden (Blocked User)
      if (response.status === 403) {
        const data = response.data;
        const isBlocked = 
          data.errorCode === 'ACCOUNT_BLOCKED' || 
          (data.message && data.message.toLowerCase().includes('blocked'));

        if (isBlocked && !isRedirecting) {
          isRedirecting = true;
          console.warn('[API] 🚫 Account BLOCKED detected. Purging session...');
          localStorage.removeItem('userInfo');
          window.location.href = '/login?reason=blocked';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
