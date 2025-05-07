const express = require('express');
const {
  getProfile,
  updateProfile,
  getAnalytics,
  getClient
} = require('../controllers/clientController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Get and update client profile
router
  .route('/profile')
  .get(protect, authorize('client'), getProfile)
  .put(protect, authorize('client'), updateProfile);

// Get client analytics
router.route('/analytics').get(protect, authorize('client'), getAnalytics);

// Get client by ID
router.route('/:id').get(getClient);

module.exports = router;
