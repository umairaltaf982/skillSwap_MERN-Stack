const express = require('express');
const {
  getPlatformStats,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getPendingVerifications,
  updateVerificationStatus,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/adminController');

const {
  getPlatformAnalytics,
  getUserAnalytics
} = require('../controllers/analyticsController');

const {
  getNotificationTemplates,
  getNotificationTemplate,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate
} = require('../controllers/notificationTemplateController');

const {
  getScheduledNotifications,
  getScheduledNotification,
  createScheduledNotification,
  updateScheduledNotification,
  cancelScheduledNotification,
  deleteScheduledNotification
} = require('../controllers/scheduledNotificationController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Apply admin authorization to all routes
router.use(protect, authorize('admin'));

// Platform statistics
router.route('/stats').get(getPlatformStats);

// User routes
router.route('/users').get(getUsers);
router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

// Verification routes
router.route('/verifications').get(getPendingVerifications);
router.route('/verifications/:freelancerId/:documentId').put(updateVerificationStatus);

// Project routes
router.route('/projects').get(getAllProjects);
router.route('/projects/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

// Analytics routes
router.route('/analytics').get(getPlatformAnalytics);
router.route('/analytics/users').get(getUserAnalytics);

// Notification template routes
router.route('/notification-templates')
  .get(getNotificationTemplates)
  .post(createNotificationTemplate);
router.route('/notification-templates/:id')
  .get(getNotificationTemplate)
  .put(updateNotificationTemplate)
  .delete(deleteNotificationTemplate);

// Scheduled notification routes
router.route('/scheduled-notifications')
  .get(getScheduledNotifications)
  .post(createScheduledNotification);
router.route('/scheduled-notifications/:id')
  .get(getScheduledNotification)
  .put(updateScheduledNotification)
  .delete(deleteScheduledNotification);
router.route('/scheduled-notifications/:id/cancel')
  .put(cancelScheduledNotification);

module.exports = router;
