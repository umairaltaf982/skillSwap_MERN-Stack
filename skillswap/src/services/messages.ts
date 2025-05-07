import api from './api';

// Interface for message data
interface MessageData {
  content: string;
  projectId?: string;
}

// Message service with methods for messaging operations
const messageService = {
  // Get all conversations for current user
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  // Get messages between current user and another user
  getMessages: async (userId: string) => {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
  },

  // Send a message
  sendMessage: async (userId: string, messageData: MessageData) => {
    const response = await api.post(`/messages/${userId}`, messageData);
    return response.data;
  },

  // Get unread message count
  getUnreadCount: async () => {
    const response = await api.get('/messages/unread');
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (userId: string) => {
    const response = await api.put(`/messages/${userId}/read`);
    return response.data;
  },
};

export default messageService;
