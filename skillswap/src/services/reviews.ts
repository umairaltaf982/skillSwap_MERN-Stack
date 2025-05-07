import api from './api';

interface CreateReviewData {
  freelancer: string;
  project?: string;
  rating: number;
  title: string;
  comment: string;
}

const reviewService = {
  // Get all reviews for a freelancer
  getReviewsForFreelancer: async (freelancerId: string) => {
    try {
      const response = await api.get(`/reviews/freelancer/${freelancerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews for freelancer:', error);
      throw error;
    }
  },

  // Create a new review
  createReview: async (reviewData: CreateReviewData) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Respond to a review (for freelancers)
  respondToReview: async (reviewId: string, comment: string) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/respond`, {
        comment,
      });
      return response.data;
    } catch (error) {
      console.error('Error responding to review:', error);
      throw error;
    }
  },

  // Get reviews for specific project
  getReviewsForProject: async (projectId: string) => {
    try {
      const response = await api.get(`/reviews/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews for project:', error);
      throw error;
    }
  },
};

export default reviewService;
