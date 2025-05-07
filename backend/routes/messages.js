const express = require('express');
const {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  markAsRead
} = require('../controllers/messageController');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Get all conversations for current user
router.route('/conversations').get(protect, getConversations);

// Get unread message count
router.route('/unread').get(protect, getUnreadCount);

// Get messages between current user and another user
router.route('/:userId')
  .get(protect, getMessages)
  .post(protect, sendMessage);

// Mark messages as read
router.route('/:userId/read').put(protect, markAsRead);

module.exports = router;
