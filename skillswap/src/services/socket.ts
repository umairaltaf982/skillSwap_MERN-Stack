import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  // Initialize socket connection
  init(token: string) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.token = token;

    try {
      // Use the correct backend URL
      const backendUrl = 'http://localhost:5000';
      this.socket = io(backendUrl, {
        auth: {
          token,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000, // Increase timeout to 10 seconds
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);

        // Attempt to reconnect if disconnected due to transport close
        if (reason === 'transport close' && this.token) {
          console.log('Attempting to reconnect...');
          setTimeout(() => {
            this.init(this.token!);
          }, 2000);
        }
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      this.socket.io.on('reconnect', (attempt) => {
        console.log(`Socket reconnected after ${attempt} attempts`);
      });

      this.socket.io.on('reconnect_attempt', (attempt) => {
        console.log(`Socket reconnection attempt #${attempt}`);
      });

      this.socket.io.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error);
      });

      this.socket.io.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
      });

      return this.socket;
    } catch (error) {
      console.error('Error initializing socket:', error);
      throw error;
    }
  }

  // Get socket instance
  getSocket(): Socket {
    if (!this.socket) {
      const token = localStorage.getItem('token');
      if (token) {
        this.init(token);
      } else {
        throw new Error('No authentication token available');
      }
    }

    if (!this.socket) {
      throw new Error('Failed to initialize socket connection');
    }

    return this.socket;
  }

  // Join a project room to receive real-time updates
  joinProject(projectId: string) {
    const socket = this.getSocket();
    socket.emit('join_project', projectId);
  }

  // Join a chat room to receive real-time messages
  joinChat(userId: string) {
    const socket = this.getSocket();
    // Use the user's ID from the socket auth instead of socket.id
    // This ensures consistency across reconnections
    const currentUserId = socket.auth?.token
      ? JSON.parse(atob(socket.auth.token.split('.')[1])).id
      : socket.id;
    const chatId = [currentUserId, userId].sort().join('-');
    console.log(`Joining chat room: chat_${chatId}`);

    // Set up a one-time listener for the chat_joined event
    socket.once('chat_joined', (data) => {
      console.log(`Successfully joined chat: ${data.chatId}`);
    });

    // Join the chat room
    socket.emit('join_chat', chatId);

    return chatId;
  }

  // Listen for new bids on a project
  onNewBid(callback: (data: any) => void) {
    const socket = this.getSocket();
    socket.on('new-bid', callback);
    return () => socket.off('new-bid', callback);
  }

  // Listen for bid updates
  onBidUpdated(callback: (data: any) => void) {
    const socket = this.getSocket();
    socket.on('bid-updated', callback);
    return () => socket.off('bid-updated', callback);
  }

  // Listen for bid deletions
  onBidDeleted(callback: (data: any) => void) {
    const socket = this.getSocket();
    socket.on('bid-deleted', callback);
    return () => socket.off('bid-deleted', callback);
  }

  // Listen for bid acceptance
  onBidAccepted(callback: (data: any) => void) {
    const socket = this.getSocket();
    socket.on('bid-accepted', callback);
    return () => socket.off('bid-accepted', callback);
  }

  // Listen for bid rejection
  onBidRejected(callback: (data: any) => void) {
    const socket = this.getSocket();
    socket.on('bid-rejected', callback);
    return () => socket.off('bid-rejected', callback);
  }

  // Listen for counter offers
  onBidCountered(callback: (data: any) => void) {
    const socket = this.getSocket();
    socket.on('bid-countered', callback);
    return () => socket.off('bid-countered', callback);
  }

  // Listen for counter offer acceptance
  onCounterAccepted(callback: (data: any) => void) {
    const socket = this.getSocket();
    socket.on('counter-accepted', callback);
    return () => socket.off('counter-accepted', callback);
  }

  // Listen for new messages
  onNewMessage(callback: (data: any) => void) {
    const socket = this.getSocket();
    socket.on('new-message', (data) => {
      console.log('Socket received new-message event:', data);
      callback(data);
    });
    return () => socket.off('new-message', callback);
  }

  // Listen for message read status updates
  onMessageRead(callback: (data: any) => void) {
    const socket = this.getSocket();
    socket.on('message-read', callback);
    return () => socket.off('message-read', callback);
  }

  // Send read receipt
  sendReadReceipt(messageIds: string[]) {
    if (!messageIds.length) return;
    const socket = this.getSocket();
    socket.emit('read_messages', { messageIds });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
