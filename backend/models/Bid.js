const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Freelancer',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add a bid amount']
  },
  deliveryTime: {
    type: Number,
    required: [true, 'Please add delivery time in days']
  },
  proposal: {
    type: String,
    required: [true, 'Please add a proposal'],
    maxlength: [2000, 'Proposal cannot be more than 2000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'countered'],
    default: 'pending'
  },
  counterOffer: {
    amount: {
      type: Number
    },
    deliveryTime: {
      type: Number
    },
    message: {
      type: String,
      maxlength: [1000, 'Counter offer message cannot be more than 1000 characters']
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Prevent freelancer from submitting multiple bids for the same project
BidSchema.index({ project: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model('Bid', BidSchema);
