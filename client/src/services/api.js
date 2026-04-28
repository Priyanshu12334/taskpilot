import axios from 'axios';

const API =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API + '/api',
});

// Interceptor to attach the token automatically to requests
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to handle forced logouts for blocked users
let isRedirecting = false; // Prevent multiple redirects on concurrent 403s

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (response && response.status === 403) {
      const data = response.data;
      const isBlocked = 
        data.errorCode === 'ACCOUNT_BLOCKED' || 
        (data.message && data.message.toLowerCase().includes('blocked'));

      if (isBlocked && !isRedirecting) {
        isRedirecting = true;
        console.warn('[API] 🚫 Account BLOCKED detected. Purging session...');
        
        localStorage.removeItem('userInfo');
        
        // Redirect with reason so Login page can show specific alert
        window.location.href = '/login?reason=blocked';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
