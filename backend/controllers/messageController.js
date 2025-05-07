const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    // Find all users that the current user has exchanged messages with
    const sentMessages = await Message.find({ sender: req.user.id }).distinct(
      'receiver'
    );

    const receivedMessages = await Message.find({
      receiver: req.user.id,
    }).distinct('sender');

    // Combine and remove duplicates
    const conversationUserIds = [
      ...new Set([...sentMessages, ...receivedMessages]),
    ];

    // Get user details for each conversation
    const conversations = await User.find({
      _id: { $in: conversationUserIds },
    }).select('name email role');

    // For each conversation, get the latest message and unread count
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (user) => {
        // Get latest message
        const latestMessage = await Message.findOne({
          $or: [
            { sender: req.user.id, receiver: user._id },
            { sender: user._id, receiver: req.user.id },
          ],
        }).sort('-createdAt');

        // Get unread count
        const unreadCount = await Message.countDocuments({
          sender: user._id,
          receiver: req.user.id,
          readStatus: false,
        });

        return {
          user,
          latestMessage,
          unreadCount,
        };
      })
    );

    // Sort by latest message
    conversationsWithDetails.sort((a, b) => {
      return (
        new Date(b.latestMessage.createdAt) -
        new Date(a.latestMessage.createdAt)
      );
    });

    res.status(200).json({
      success: true,
      count: conversationsWithDetails.length,
      data: conversationsWithDetails,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get messages between current user and another user
// @route   GET /api/messages/:userId
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    // Check if the other user exists
    const otherUser = await User.findById(req.params.userId);

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Get messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id },
      ],
    }).sort('createdAt');

    // Mark messages as read
    await Message.updateMany(
      {
        sender: req.params.userId,
        receiver: req.user.id,
        readStatus: false,
      },
      {
        readStatus: true,
        readAt: Date.now(),
      }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message
// @route   POST /api/messages/:userId
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { content, projectId } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Please provide message content',
      });
    }

    // Check if the recipient exists
    const recipient = await User.findById(req.params.userId);

    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found',
      });
    }

    // Create message with metadata for hashing
    const message = new Message({
      sender: req.user.id,
      receiver: req.params.userId,
      content,
      project: projectId || undefined,
      _senderIP: req.ip, // This will be hashed in the pre-save hook
      _userAgent: req.headers['user-agent'], // This will be hashed in the pre-save hook
    });

    await message.save();

    // Create notification for recipient
    await Notification.create({
      recipient: req.params.userId,
      sender: req.user.id,
      type: 'new-message',
      title: 'New Message',
      message: `You have received a new message from ${req.user.name}.`,
      relatedMessage: message._id,
      relatedProject: projectId || undefined,
    });

    // Emit socket event for real-time updates
    const chatId = [req.user.id, req.params.userId].sort().join('-');
    console.log(`Emitting new-message event to chat_${chatId}`);

    // Populate the message with sender and receiver details before emitting
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name')
      .populate('receiver', 'name');

    if (req.io) {
      req.io.to(`chat_${chatId}`).emit('new-message', populatedMessage);
      console.log('Socket event emitted successfully');
    } else {
      console.error('Socket.io instance not available on request object');
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiver: req.user.id,
      readStatus: false,
    });

    res.status(200).json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/:userId/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    // Mark all messages from the specified user as read
    await Message.updateMany(
      {
        sender: req.params.userId,
        receiver: req.user.id,
        readStatus: false,
      },
      {
        readStatus: true,
        readAt: Date.now(),
      }
    );

    res.status(200).json({
      success: true,
      data: {
        message: 'Messages marked as read',
      },
    });
  } catch (err) {
    next(err);
  }
};
