import api from './api';

// Interface for freelancer profile data
interface FreelancerProfile {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  bio?: string;
  hourlyRate?: number;
  availability?: string;
  completedProjects?: number;
  averageRating?: number;
  reviews?: {
    count: number;
    average: number;
  };
  location?: string;
  languages?: string[];
  createdAt: string;
}

// Freelancer service with methods for freelancer operations
const freelancerService = {
  // Get all freelancers with optional filters
  getFreelancers: async (filters = {}) => {
    try {
      const response = await api.get('/freelancers', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching freelancers:', error);
      throw error;
    }
  },

  // Get current freelancer profile
  getProfile: async () => {
    try {
      const response = await api.get('/freelancers/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching freelancer profile:', error);
      throw error;
    }
  },

  // Update freelancer profile
  updateProfile: async (profileData: Partial<FreelancerProfile>) => {
    try {
      const response = await api.put('/freelancers/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating freelancer profile:', error);
      throw error;
    }
  },

  // Get a single freelancer by ID
  getFreelancer: async (id: string) => {
    try {
      const response = await api.get(`/freelancers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching freelancer ${id}:`, error);
      throw error;
    }
  },

  // Get top rated freelancers
  getTopRatedFreelancers: async (limit = 5) => {
    try {
      const response = await api.get('/freelancers/top-rated', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top rated freelancers:', error);
      throw error;
    }
  },

  // Search freelancers by skills
  searchFreelancersBySkills: async (skills: string[]) => {
    try {
      const response = await api.get('/freelancers/search', {
        params: { skills },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching freelancers by skills:', error);
      throw error;
    }
  },

  // Get reviews for a freelancer
  getFreelancerReviews: async (freelancerId: string) => {
    try {
      const response = await api.get(`/freelancers/${freelancerId}/reviews`);
      return response.data;
    } catch (error) {
      console.error('Error fetching freelancer reviews:', error);
      throw error;
    }
  },

  // Get average rating for a freelancer
  getFreelancerRating: async (freelancerId: string) => {
    try {
      const response = await api.get(`/freelancers/${freelancerId}/rating`);
      return response.data;
    } catch (error) {
      console.error('Error fetching freelancer rating:', error);
      throw error;
    }
  },
};

export default freelancerService;
