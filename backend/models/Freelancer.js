const mongoose = require('mongoose');
const User = require('./User');

const FreelancerSchema = new mongoose.Schema({
  skills: [
    {
      type: String,
      required: true,
    },
  ],
  hourlyRate: {
    type: Number,
    min: [0, 'Hourly rate cannot be negative'],
  },
  availability: {
    type: String,
    enum: [
      'Full-time',
      'Part-time',
      'Weekends only',
      'Evenings only',
      'Limited availability',
    ],
  },
  portfolio: [
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
      },
      imageUrl: {
        type: String,
      },
      projectUrl: {
        type: String,
      },
    },
  ],
  education: [
    {
      institution: {
        type: String,
        required: true,
      },
      degree: {
        type: String,
        required: true,
      },
      fieldOfStudy: {
        type: String,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
      },
    },
  ],
  experience: [
    {
      title: {
        type: String,
        required: true,
      },
      company: {
        type: String,
        required: true,
      },
      location: {
        type: String,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
      },
    },
  ],
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationLevel: {
    type: String,
    enum: ['Basic', 'Verified', 'Premium'],
    default: 'Basic',
  },
  verificationDocuments: [
    {
      documentType: {
        type: String,
        required: true,
      },
      documentUrl: {
        type: String,
        required: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
      },
    },
  ],
  bids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
    },
  ],
  activeProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
  completedProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
  },
  contracts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
    },
  ],
});

// Calculate average rating when reviews are modified
FreelancerSchema.pre('save', async function (next) {
  if (this.reviews && this.reviews.length > 0) {
    const Review = mongoose.model('Review');
    const reviews = await Review.find({ _id: { $in: this.reviews } });

    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      this.averageRating = totalRating / reviews.length;
    }
  }
  next();
});

const Freelancer = User.discriminator('Freelancer', FreelancerSchema);

module.exports = Freelancer;
