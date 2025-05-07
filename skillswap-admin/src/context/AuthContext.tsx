import { createContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../utils/axiosConfig';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: () => {},
  error: null,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      console.log('Checking if user is logged in...');
      try {
        const storedUser = localStorage.getItem('adminUser');
        console.log('Stored user in localStorage:', storedUser ? 'exists' : 'not found');

        if (storedUser) {
          // Get stored user data
          const userData = JSON.parse(storedUser);
          console.log('Parsed user data:', {
            _id: userData._id,
            name: userData.name,
            role: userData.role,
            tokenExists: !!userData.token
          });

          // Set user data
          setUser(userData);
          setIsAuthenticated(true);
          setError(null);
          console.log('User authenticated from localStorage');
        } else {
          console.log('No user found in localStorage');
        }
      } catch (err) {
        console.error('Error checking logged in status:', err);
        localStorage.removeItem('adminUser');
        setUser(null);
        setIsAuthenticated(false);
        setError('Authentication failed. Please log in again.');
      }

      setLoading(false);
      console.log('Auth loading complete');
    };

    checkLoggedIn();
  }, []);

  // Login user with real authentication
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      console.log('Sending login request to API with:', { email, password });

      // Make the API request
      const response = await axiosInstance.post('/api/auth/login', {
        email,
        password
      });

      console.log('Login response:', response.data);

      const userData = response.data.data;
      console.log('User data from response:', userData);

      // Check if user is an admin
      if (userData.role !== 'admin') {
        console.error('User is not an admin:', userData.role);
        setError('Access denied. Admin privileges required.');
        throw new Error('Access denied. Admin privileges required.');
      }

      console.log('Admin user authenticated successfully');

      // Store user in localStorage
      localStorage.setItem('adminUser', JSON.stringify(userData));
      console.log('User data stored in localStorage');

      // Set user data
      setUser(userData);
      setIsAuthenticated(true);
      console.log('Authentication state updated');

      // Return success to indicate login was successful
      return true;
    } catch (err: any) {
      console.error('Login error details:', err);
      console.error('Response data:', err.response?.data);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      throw err; // Re-throw the error so the Login component can catch it
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('adminUser');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
