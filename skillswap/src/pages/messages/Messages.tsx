import { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

import messageService from '../../services/messages';
import socketService from '../../services/socket';
import { FaPaperPlane, FaUser, FaSpinner } from 'react-icons/fa';
import ConversationList from '../../components/messages/ConversationList';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
  };
  receiver: {
    _id: string;
    name: string;
  };
  content: string;
  createdAt: string;
  read: boolean;
  projectId?: string;
}

const Messages = () => {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await messageService.getConversations();
        setConversations(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations');
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages when userId changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!userId) return;

      try {
        setChatLoading(true);
        const response = await messageService.getMessages(userId);
        setMessages(response.data);
        setChatLoading(false);

        // Mark messages as read
        await messageService.markAsRead(userId);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
        setChatLoading(false);
      }
    };

    fetchMessages();

    // Join chat room using socket
    if (userId && user) {
      try {
        console.log(`Joining chat with userId: ${userId}`);
        socketService.joinChat(userId);
      } catch (err) {
        console.error('Error joining chat room:', err);
        // Try to reconnect socket if there was an error
        try {
          const token = localStorage.getItem('token');
          if (token) {
            console.log('Attempting to reconnect socket...');
            socketService.init(token);
            socketService.joinChat(userId);
          }
        } catch (reconnectErr) {
          console.error('Failed to reconnect socket:', reconnectErr);
        }
      }
    }

    // Listen for new messages
    const unsubscribe = socketService.onNewMessage((data) => {
      console.log('Socket received message:', data);

      // Extract the actual message object (backend sends it wrapped in a 'message' property)
      const messageData = data.message || data;

      if (
        (messageData.sender._id === userId &&
          messageData.receiver._id === user?._id) ||
        (messageData.sender._id === user?._id &&
          messageData.receiver._id === userId)
      ) {
        setMessages((prev) => {
          // Check if this is a message we already added as a temporary message
          const isOurTempMessage =
            messageData.sender._id === user?._id &&
            prev.some(
              (msg) =>
                msg._id.startsWith('temp-') &&
                msg.content === messageData.content &&
                Math.abs(
                  new Date(msg.createdAt).getTime() -
                    new Date(messageData.createdAt).getTime()
                ) < 60000 // Within 1 minute
            );

          if (isOurTempMessage) {
            // Replace the temporary message with the real one
            return prev.map((msg) =>
              msg._id.startsWith('temp-') &&
              msg.content === messageData.content &&
              Math.abs(
                new Date(msg.createdAt).getTime() -
                  new Date(messageData.createdAt).getTime()
              ) < 60000
                ? messageData
                : msg
            );
          } else {
            // Add as a new message
            return [...prev, messageData];
          }
        });

        // Mark message as read if it's visible in the current chat
        if (messageData.sender._id === userId && userId) {
          messageService.markAsRead(userId);
        }
      }

      // Update conversation list with new message
      setConversations((prev) => {
        // Extract the actual message object (backend sends it wrapped in a 'message' property)
        const messageData = data.message || data;

        const existingConvIndex = prev.findIndex(
          (conv) =>
            conv.user._id === messageData.sender._id ||
            conv.user._id === messageData.receiver._id
        );

        if (existingConvIndex >= 0) {
          const updatedConversations = [...prev];
          updatedConversations[existingConvIndex].lastMessage =
            messageData.content;
          updatedConversations[existingConvIndex].updatedAt =
            messageData.createdAt;
          return updatedConversations;
        } else {
          // Add new conversation if it doesn't exist
          const newUser =
            messageData.sender._id === user?._id
              ? messageData.receiver
              : messageData.sender;
          return [
            {
              user: newUser,
              lastMessage: messageData.content,
              updatedAt: messageData.createdAt,
              unreadCount: messageData.sender._id === user?._id ? 0 : 1,
            },
            ...prev,
          ];
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [userId, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !userId || !user) return;

    try {
      setIsSending(true);

      const messageData = {
        content: newMessage,
        ...(projectId ? { projectId } : {}),
      };

      // Get recipient name from existing messages or use userId as fallback
      const recipientName =
        messages.length > 0
          ? messages[0].sender._id === user._id
            ? messages[0].receiver.name
            : messages[0].sender.name
          : 'Recipient';

      // Create a temporary message to display immediately
      const tempMessage: Message = {
        _id: `temp-${Date.now()}`, // Temporary ID that will be replaced when the real message comes back
        sender: {
          _id: user._id,
          name: user.name,
        },
        receiver: {
          _id: userId,
          name: recipientName,
        },
        content: newMessage,
        createdAt: new Date().toISOString(),
        read: false,
        ...(projectId ? { projectId } : {}),
      };

      // Add the temporary message to the UI immediately
      setMessages((prevMessages) => [...prevMessages, tempMessage]);

      // Also update the conversation list immediately
      setConversations((prev) => {
        const existingConvIndex = prev.findIndex(
          (conv) => conv.user._id === userId
        );

        if (existingConvIndex >= 0) {
          const updatedConversations = [...prev];
          updatedConversations[existingConvIndex].lastMessage = newMessage;
          updatedConversations[existingConvIndex].updatedAt =
            new Date().toISOString();
          return updatedConversations;
        }
        return prev;
      });

      // Send the message to the server
      await messageService.sendMessage(userId, messageData);

      // Clear the input and reset sending state
      setNewMessage('');
      setIsSending(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      setIsSending(false);

      // Remove the temporary message if sending failed
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => !msg._id.startsWith('temp-'))
      );
    }
  };

  // Format date
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else {
      return date.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  if (!user) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline">
          {' '}
          You must be logged in to view messages.
        </span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Conversations Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-3 border-b bg-gray-100">
              <h2 className="font-semibold text-gray-800">Chats</h2>
            </div>

            <ConversationList
              conversations={conversations}
              activeUserId={userId}
              loading={loading}
            />
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow flex flex-col h-[600px]">
            {userId ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b bg-gray-100 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white mr-3">
                    <FaUser />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold">
                      {messages.length > 0
                        ? messages[0].sender._id === user._id
                          ? messages[0].receiver.name
                          : messages[0].sender.name
                        : 'Chat'}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {userId ? 'Online' : ''}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto p-4 bg-repeat bg-gray-50"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23e5e7eb' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                    backgroundSize: '300px 300px',
                  }}
                >
                  {chatLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <FaSpinner className="animate-spin text-2xl text-primary-600" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <p>No messages yet</p>
                      <p className="text-sm">
                        Start the conversation by sending a message below
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {messages.map((message, index) => {
                        // Check if this message is from the same sender as the previous one
                        const prevMessage =
                          index > 0 ? messages[index - 1] : null;
                        const nextMessage =
                          index < messages.length - 1
                            ? messages[index + 1]
                            : null;
                        const isFirstInGroup =
                          !prevMessage ||
                          prevMessage.sender._id !== message.sender._id;
                        const isLastInGroup =
                          !nextMessage ||
                          nextMessage.sender._id !== message.sender._id;

                        // Time gap detection (more than 10 minutes between messages)
                        const timeGap =
                          prevMessage &&
                          new Date(message.createdAt).getTime() -
                            new Date(prevMessage.createdAt).getTime() >
                            10 * 60 * 1000;

                        // Make sure we're correctly identifying messages sent by the current user
                        const isSentByMe = message.sender._id === user._id;
                        console.log(
                          `Message ${message._id} - Sender: ${message.sender._id}, User: ${user._id}, isSentByMe: ${isSentByMe}`
                        );

                        return (
                          <div key={message._id}>
                            {/* Show timestamp if it's the first message or there's a time gap */}
                            {(index === 0 || timeGap) && (
                              <div className="flex justify-center my-4">
                                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                                  {formatMessageDate(message.createdAt)}
                                </span>
                              </div>
                            )}

                            <div
                              className={`flex ${
                                isSentByMe ? 'justify-end' : 'justify-start'
                              } ${isFirstInGroup ? 'mt-2' : 'mt-1'}`}
                            >
                              {/* Message bubble with tail */}
                              <div
                                className={`relative max-w-[75%] px-3 py-2 rounded-lg
                                  ${
                                    isSentByMe
                                      ? 'bg-green-100 text-gray-800 rounded-tr-none mr-4'
                                      : 'bg-white text-gray-800 rounded-tl-none ml-4'
                                  } ${isLastInGroup ? '' : 'mb-1'}`}
                              >
                                {/* Message content */}
                                <p className="whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>

                                {/* Message timestamp and read status */}
                                <div className="flex justify-end items-center mt-1">
                                  <span className="text-[10px] text-gray-500">
                                    {new Date(
                                      message.createdAt
                                    ).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>

                                  {isSentByMe && (
                                    <span className="ml-1 text-[10px]">
                                      {message.read ? (
                                        <span className="text-blue-500">
                                          ✓✓
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">✓</span>
                                      )}
                                    </span>
                                  )}
                                </div>

                                {/* Message tail */}
                                <div
                                  className={`absolute top-0 w-4 h-4 overflow-hidden
                                    ${
                                      isSentByMe
                                        ? 'right-[-8px] transform rotate-45'
                                        : 'left-[-8px] transform -rotate-45'
                                    } ${isFirstInGroup ? 'block' : 'hidden'}`}
                                >
                                  <div
                                    className={`absolute w-4 h-4 transform rotate-45 top-0
                                      ${
                                        isSentByMe
                                          ? 'bg-green-100 -left-2'
                                          : 'bg-white -right-2'
                                      }`}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-3 border-t bg-gray-100">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 py-2 px-4 bg-white rounded-full border-0 focus:ring-1 focus:ring-green-500 focus:outline-none"
                      placeholder="Type a message"
                      disabled={isSending}
                    />
                    <button
                      type="submit"
                      className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                      disabled={isSending || !newMessage.trim()}
                    >
                      {isSending ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaPaperPlane />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
