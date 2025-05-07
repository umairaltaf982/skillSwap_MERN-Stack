const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  addMilestone,
  updateMilestoneStatus,
  getMyProjects,
} = require('../controllers/projectController');

const {
  getBidsForProject,
  createBid,
} = require('../controllers/bidController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Get all projects and create a new project
router
  .route('/')
  .get(getProjects)
  .post(protect, authorize('client'), createProject);

// Get current user's projects
router.route('/me').get(protect, getMyProjects);

// Get, update, and delete a specific project
router
  .route('/:id')
  .get(getProject)
  .put(protect, authorize('client'), updateProject)
  .delete(protect, authorize('client'), deleteProject);

// Update project status
router
  .route('/:id/status')
  .put(protect, authorize('client', 'freelancer'), updateProjectStatus);

// Add milestone to project
router
  .route('/:id/milestones')
  .post(protect, authorize('client'), addMilestone);

// Update milestone status
router
  .route('/:id/milestones/:milestoneId')
  .put(protect, authorize('client', 'freelancer'), updateMilestoneStatus);

// Get all bids for a project and create a new bid
router
  .route('/:projectId/bids')
  .get(protect, authorize('client'), getBidsForProject)
  .post(protect, authorize('freelancer'), createBid);

module.exports = router;
