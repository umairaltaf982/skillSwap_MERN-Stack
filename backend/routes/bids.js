const express = require('express');
const {
  getBid,
  updateBid,
  deleteBid,
  acceptBid,
  rejectBid,
  counterBid,
  acceptCounterOffer,
  getMyBids
} = require('../controllers/bidController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Get all bids for current freelancer
router.route('/me').get(protect, authorize('freelancer'), getMyBids);

// Get, update, and delete a specific bid
router
  .route('/:id')
  .get(protect, getBid)
  .put(protect, authorize('freelancer'), updateBid)
  .delete(protect, authorize('freelancer'), deleteBid);

// Accept a bid
router.route('/:id/accept').put(protect, authorize('client'), acceptBid);

// Reject a bid
router.route('/:id/reject').put(protect, authorize('client'), rejectBid);

// Counter offer on a bid
router.route('/:id/counter').put(protect, authorize('client'), counterBid);

// Accept counter offer
router
  .route('/:id/accept-counter')
  .put(protect, authorize('freelancer'), acceptCounterOffer);

module.exports = router;
