import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get user from localStorage
    const userString = localStorage.getItem('adminUser');

    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user && user.token) {
          // Add token to headers
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear localStorage and redirect to login
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
