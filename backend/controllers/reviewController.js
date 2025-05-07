const Review = require('../models/Review');
const Project = require('../models/Project');
const Freelancer = require('../models/Freelancer');
const Notification = require('../models/Notification');

// @desc    Get all reviews for a freelancer
// @route   GET /api/freelancers/:freelancerId/reviews
// @access  Public
exports.getFreelancerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ freelancer: req.params.freelancerId })
      .populate({
        path: 'client',
        select: 'name',
      })
      .populate({
        path: 'project',
        select: 'title',
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reviews for a project
// @route   GET /api/projects/:projectId/reviews
// @access  Public
exports.getProjectReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ project: req.params.projectId })
      .populate({
        path: 'client',
        select: 'name',
      })
      .populate({
        path: 'freelancer',
        select: 'name',
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate({
        path: 'client',
        select: 'name',
      })
      .populate({
        path: 'freelancer',
        select: 'name',
      })
      .populate({
        path: 'project',
        select: 'title',
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (Client only)
exports.createReview = async (req, res, next) => {
  try {
    // Add client to req.body
    req.body.client = req.user.id;

    // Set default title if not provided
    if (!req.body.title) {
      req.body.title = 'Review';
    }

    // Check if freelancer exists
    if (!req.body.freelancer) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a freelancer ID',
      });
    }

    const freelancer = await Freelancer.findById(req.body.freelancer);

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        error: 'Freelancer not found',
      });
    }

    // Check if client has already reviewed this freelancer directly (without a project)
    if (!req.body.project) {
      const existingDirectReview = await Review.findOne({
        freelancer: req.body.freelancer,
        client: req.user.id,
        project: { $exists: false },
      });

      if (existingDirectReview) {
        return res.status(400).json({
          success: false,
          error: 'You have already reviewed this freelancer',
        });
      }
    }

    // If project ID is provided, validate it
    if (req.body.project) {
      const project = await Project.findById(req.body.project);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found',
        });
      }

      // Check if user is the project owner
      if (project.client.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to review this project',
        });
      }

      // Check if project is completed
      if (project.status !== 'completed') {
        return res.status(400).json({
          success: false,
          error: 'Cannot review a project that is not completed',
        });
      }

      // Check if project has a freelancer
      if (!project.freelancer) {
        return res.status(400).json({
          success: false,
          error: 'Project does not have a freelancer assigned',
        });
      }

      // Check if user has already reviewed this project
      const existingProjectReview = await Review.findOne({
        project: req.body.project,
        client: req.user.id,
      });

      if (existingProjectReview) {
        return res.status(400).json({
          success: false,
          error: 'You have already reviewed this project',
        });
      }
    }

    // Create review
    const review = await Review.create(req.body);

    // Add review to freelancer's reviews
    await Freelancer.findByIdAndUpdate(req.body.freelancer, {
      $push: { reviews: review._id },
    });

    // Create notification for freelancer
    let notificationMessage = 'You have received a new review.';
    if (req.body.project) {
      const project = await Project.findById(req.body.project);
      notificationMessage = `You have received a new review for the project "${project.title}".`;
    }

    await Notification.create({
      recipient: req.body.freelancer,
      sender: req.user.id,
      type: 'review-received',
      title: 'New Review Received',
      message: notificationMessage,
      relatedProject: req.body.project,
      relatedReview: review._id,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (err) {
    console.error('Error creating review:', err);
    next(err);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Client only)
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    // Make sure user is review owner
    if (review.client.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this review',
      });
    }

    // Update review
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Create notification for freelancer
    await Notification.create({
      recipient: review.freelancer,
      sender: req.user.id,
      type: 'review-received',
      title: 'Review Updated',
      message: `A review for one of your projects has been updated.`,
      relatedReview: review._id,
    });

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Client only)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    // Make sure user is review owner
    if (review.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this review',
      });
    }

    await review.deleteOne();

    // Remove review from freelancer's reviews
    await Freelancer.findByIdAndUpdate(review.freelancer, {
      $pull: { reviews: review._id },
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add response to a review
// @route   PUT /api/reviews/:id/response
// @access  Private (Freelancer only)
exports.addResponse = async (req, res, next) => {
  try {
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a response comment',
      });
    }

    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    // Make sure user is the freelancer being reviewed
    if (review.freelancer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to respond to this review',
      });
    }

    // Add response
    review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        response: {
          comment,
          createdAt: Date.now(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // Create notification for client
    await Notification.create({
      recipient: review.client,
      sender: req.user.id,
      type: 'review-received',
      title: 'Response to Your Review',
      message: `A freelancer has responded to your review.`,
      relatedReview: review._id,
    });

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (err) {
    next(err);
  }
};
