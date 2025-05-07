const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications
} = require('../controllers/notificationController');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

// Get all notifications and unread count
router.route('/').get(getNotifications);
router.route('/unread').get(getUnreadCount);

// Mark all as read
router.route('/read-all').put(markAllAsRead);

// Delete all read notifications
router.route('/read').delete(deleteReadNotifications);

// Mark single notification as read
router.route('/:id/read').put(markAsRead);

// Delete single notification
router.route('/:id').delete(deleteNotification);

module.exports = router;
