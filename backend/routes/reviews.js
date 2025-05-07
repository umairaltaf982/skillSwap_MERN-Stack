const express = require('express');
const {
  getReview,
  updateReview,
  deleteReview,
  addResponse,
  createReview,
  getFreelancerReviews,
} = require('../controllers/reviewController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Create a new review directly
router.route('/').post(protect, authorize('client'), createReview);

// Get reviews for a freelancer
router.route('/freelancer/:freelancerId').get(getFreelancerReviews);

// Get, update, and delete a specific review
router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('client'), updateReview)
  .delete(protect, authorize('client', 'admin'), deleteReview);

// Add response to a review
router
  .route('/:id/response')
  .put(protect, authorize('freelancer'), addResponse);

module.exports = router;
