import api from './api';

// Interface for client profile data
interface ClientProfile {
  _id: string;
  name: string;
  email: string;
  company?: string;
  website?: string;
  location?: string;
  bio?: string;
  projects?: string[];
  createdAt: string;
}

// Client service with methods for client operations
const clientService = {
  // Get client by ID
  getClient: async (id: string) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching client ${id}:`, error);
      throw error;
    }
  },
  
  // Get current client profile
  getProfile: async () => {
    try {
      const response = await api.get('/clients/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching client profile:', error);
      throw error;
    }
  },
  
  // Update client profile
  updateProfile: async (profileData: Partial<ClientProfile>) => {
    try {
      const response = await api.put('/clients/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating client profile:', error);
      throw error;
    }
  },
  
  // Get client analytics
  getAnalytics: async () => {
    try {
      const response = await api.get('/clients/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching client analytics:', error);
      throw error;
    }
  },
};

export default clientService;
