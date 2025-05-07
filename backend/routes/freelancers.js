const express = require('express');
const {
  getFreelancers,
  getFreelancer,
  getProfile,
  updateProfile,
  addPortfolioItem,
  deletePortfolioItem,
  addEducation,
  deleteEducation,
  addExperience,
  deleteExperience,
  uploadVerificationDocument,
  getAnalytics,
} = require('../controllers/freelancerController');

const {
  getFreelancerReviews,
  createReview,
} = require('../controllers/reviewController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Get all freelancers
router.route('/').get(getFreelancers);

// Get freelancer analytics
router.route('/analytics').get(protect, authorize('freelancer'), getAnalytics);

// Get and update freelancer profile
router
  .route('/profile')
  .get(protect, authorize('freelancer'), getProfile)
  .put(protect, authorize('freelancer'), updateProfile);

// Portfolio routes
router
  .route('/portfolio')
  .post(protect, authorize('freelancer'), addPortfolioItem);

router
  .route('/portfolio/:id')
  .delete(protect, authorize('freelancer'), deletePortfolioItem);

// Education routes
router.route('/education').post(protect, authorize('freelancer'), addEducation);

router
  .route('/education/:id')
  .delete(protect, authorize('freelancer'), deleteEducation);

// Experience routes
router
  .route('/experience')
  .post(protect, authorize('freelancer'), addExperience);

router
  .route('/experience/:id')
  .delete(protect, authorize('freelancer'), deleteExperience);

// Verification document upload
router
  .route('/verification')
  .post(protect, authorize('freelancer'), uploadVerificationDocument);

// Get single freelancer
router.route('/:id').get(getFreelancer);

// Get all reviews for a freelancer
router.route('/:freelancerId/reviews').get(getFreelancerReviews);

module.exports = router;
