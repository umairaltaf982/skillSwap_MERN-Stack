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

module.exports = router;
