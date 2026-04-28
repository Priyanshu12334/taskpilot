import axios from 'axios';

const api = axios.create({
  // If running via Vite, the proxy rule in vite.config.js forwards /api to localhost:5000.
  // Alternatively, providing the direct URL also works: 'http://localhost:5000/api'
  baseURL: '/api',
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
