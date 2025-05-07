import api from './api';

// Interface for login credentials
interface LoginCredentials {
  email: string;
  password: string;
}

// Interface for registration data
interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'client' | 'freelancer' | 'admin';
  skills?: string[];
}

// Interface for user profile
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  [key: string]: any; // For additional fields based on role
}

// Auth service with methods for authentication operations
const authService = {
  // Login user
  login: async (credentials: LoginCredentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      // Store token in local storage if authentication is successful
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register user
  register: async (userData: RegisterData) => {
    try {
      const response = await api.post('/auth/register', userData);
      // Store token in local storage if registration is successful
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData: Partial<UserProfile>) => {
    try {
      const response = await api.put('/auth/updatedetails', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Update password
  updatePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.put('/auth/updatepassword', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgotpassword', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.put(`/auth/resetpassword/${token}`, {
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.get('/auth/logout');
      // Remove token from local storage
      localStorage.removeItem('token');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove token even if API call fails
      localStorage.removeItem('token');
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },
};

export default authService;
