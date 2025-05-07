const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Freelancer',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please add a rating between 1 and 5'],
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      maxlength: [1000, 'Comment cannot be more than 1000 characters'],
    },
    response: {
      comment: {
        type: String,
        maxlength: [1000, 'Response cannot be more than 1000 characters'],
      },
      createdAt: {
        type: Date,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent client from submitting multiple reviews for the same project (only if project is provided)
ReviewSchema.index({ project: 1, client: 1 }, { unique: true, sparse: true });

// Prevent client from submitting multiple direct reviews for the same freelancer
ReviewSchema.index(
  { freelancer: 1, client: 1, project: 1 },
  { unique: true, sparse: true }
);

// Update freelancer's average rating when a review is added or modified
ReviewSchema.post('save', async function () {
  try {
    const Freelancer = this.model('Freelancer');

    // Find all reviews for this freelancer
    const reviews = await this.model('Review').find({
      freelancer: this.freelancer,
    });

    // Calculate average rating
    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating = totalRating / reviews.length;

      // Update freelancer's average rating
      await Freelancer.findByIdAndUpdate(this.freelancer, {
        averageRating,
      });
    }
  } catch (err) {
    console.error('Error updating freelancer average rating:', err);
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
