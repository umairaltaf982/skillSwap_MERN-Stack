import api from './api';

// Interface for bid data
interface BidData {
  amount: number;
  deliveryTime: number;
  proposal: string;
}

// Interface for counter offer data
interface CounterOfferData {
  amount: number;
  deliveryTime: number;
  message: string;
}

// Bid service with methods for bid operations
const bidService = {
  // Get a single bid by ID
  getBid: async (id: string) => {
    const response = await api.get(`/bids/${id}`);
    return response.data;
  },

  // Update a bid
  updateBid: async (id: string, bidData: Partial<BidData>) => {
    const response = await api.put(`/bids/${id}`, bidData);
    return response.data;
  },

  // Delete a bid
  deleteBid: async (id: string) => {
    const response = await api.delete(`/bids/${id}`);
    return response.data;
  },

  // Accept a bid
  acceptBid: async (id: string) => {
    const response = await api.put(`/bids/${id}/accept`);
    return response.data;
  },

  // Reject a bid
  rejectBid: async (id: string) => {
    const response = await api.put(`/bids/${id}/reject`);
    return response.data;
  },

  // Counter offer on a bid
  counterBid: async (id: string, counterOfferData: CounterOfferData) => {
    const response = await api.put(`/bids/${id}/counter`, counterOfferData);
    return response.data;
  },

  // Accept counter offer
  acceptCounterOffer: async (id: string) => {
    const response = await api.put(`/bids/${id}/accept-counter`);
    return response.data;
  },

  // Get all bids for current freelancer
  getMyBids: async () => {
    const response = await api.get('/bids/me');
    return response.data;
  },
};

export default bidService;
