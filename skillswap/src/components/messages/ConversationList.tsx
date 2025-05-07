import { Link } from 'react-router-dom';
import { FaUser, FaSpinner } from 'react-icons/fa';

interface ConversationProps {
  conversations: any[];
  activeUserId?: string;
  loading: boolean;
}

const ConversationList = ({
  conversations,
  activeUserId,
  loading,
}: ConversationProps) => {
  // Format date for last message
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <FaSpinner className="animate-spin text-xl text-primary-600" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="py-6 px-4 text-center text-gray-500">
        <p>No conversations yet</p>
        <p className="text-sm mt-1">
          Messages from your projects will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y overflow-y-auto max-h-[500px]">
      {conversations.map((conversation) => (
        <Link
          key={conversation.user._id}
          to={`/messages/${conversation.user._id}`}
          className={`block p-3 hover:bg-gray-50 transition duration-150 ${
            activeUserId === conversation.user._id ? 'bg-gray-100' : ''
          }`}
        >
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white mr-3 flex-shrink-0">
              <FaUser />
            </div>
            <div className="flex-1 min-w-0 border-b pb-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900 truncate">
                  {conversation.user.name}
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {conversation.updatedAt && formatDate(conversation.updatedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-500 truncate max-w-[80%]">
                  {conversation.lastMessage || 'No messages yet'}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="ml-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ConversationList;
