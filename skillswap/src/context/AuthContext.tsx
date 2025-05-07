import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'freelancer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser?: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const setAuthToken = (token: string | null) => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      delete api.defaults.headers.common['Authorization'];
    }
  };

  // Load user if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        setAuthToken(token);
        try {
          console.log('Loading user with token');
          const res = await api.get('/auth/me');
          console.log('User data loaded:', res.data);
          setUser(res.data.data);
          setIsAuthenticated(true);
        } catch (err: any) {
          console.error(
            'Error loading user:',
            err.response?.data?.error || err.message
          );
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setAuthToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Login user
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting login with:', { email });
      const res = await api.post('/auth/login', { email, password });
      console.log('Login response:', res.data);

      console.log('Full login response structure:', JSON.stringify(res.data, null, 2));

      // Check for token in the response (could be in different locations)
      if (res.data.data && res.data.data.token) {
        console.log('Token found in response.data.data');
        setToken(res.data.data.token);
        setAuthToken(res.data.data.token);

        // Set user data directly from the response
        setUser(res.data.data);
        setIsAuthenticated(true);
      } else if (res.data.token) {
        console.log('Token found in response.data');
        setToken(res.data.token);
        setAuthToken(res.data.token);

        // If user data is in a different location
        const userData = res.data.user || res.data;
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.error('No token received from server');
        console.error('Response structure:', res.data);
        setError('Authentication failed: No token received');
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          baseURL: err.config?.baseURL,
          headers: err.config?.headers
        }
      });
      setError(err.response?.data?.error || err.message || 'An error occurred during login');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setAuthToken(null);
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData: any) => {
    setLoading(true);
    try {
      console.log('Attempting registration with:', {
        ...userData,
        password: '***',
      });
      const res = await api.post('/auth/register', userData);
      console.log('Registration response:', res.data);

      console.log('Full registration response structure:', JSON.stringify(res.data, null, 2));

      // Check for token in the response (could be in different locations)
      if (res.data.data && res.data.data.token) {
        console.log('Token found in response.data.data');
        setToken(res.data.data.token);
        setAuthToken(res.data.data.token);

        // Set user data directly from the response
        setUser(res.data.data);
        setIsAuthenticated(true);
      } else if (res.data.token) {
        console.log('Token found in response.data');
        setToken(res.data.token);
        setAuthToken(res.data.token);

        // If user data is in a different location
        const userData = res.data.user || res.data;
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.error('No token received from server');
        console.error('Response structure:', res.data);
        setError('Registration failed: No token received');
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Registration error:', err.response?.data || err.message);
      setError(
        err.response?.data?.error || 'An error occurred during registration'
      );
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setAuthToken(null);
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthToken(null);
    // Ensure socket is disconnected on logout
    try {
      import('../services/socket').then((module) => {
        const socketService = module.default;
        if (socketService.getSocket) {
          const socket = socketService.getSocket();
          if (socket) socket.disconnect();
        }
      });
    } catch (error) {
      console.error('Error disconnecting socket:', error);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Update user data
  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
