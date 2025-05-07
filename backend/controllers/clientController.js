const mongoose = require('mongoose');
const Client = require('../models/Client');
const Project = require('../models/Project');
const Review = require('../models/Review');

// @desc    Get client profile
// @route   GET /api/clients/profile
// @access  Private (Client only)
exports.getProfile = async (req, res, next) => {
  try {
    const client = await Client.findById(req.user.id).select(
      '-password -verificationToken -verificationExpire -resetPasswordToken -resetPasswordExpire'
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update client profile
// @route   PUT /api/clients/profile
// @access  Private (Client only)
exports.updateProfile = async (req, res, next) => {
  try {
    // Fields to update
    const fieldsToUpdate = {};

    // Basic fields
    if (req.body.company) fieldsToUpdate.company = req.body.company;
    if (req.body.website) fieldsToUpdate.website = req.body.website;
    if (req.body.location) fieldsToUpdate.location = req.body.location;
    if (req.body.bio) fieldsToUpdate.bio = req.body.bio;

    // Update client profile
    const client = await Client.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).select(
      '-password -verificationToken -verificationExpire -resetPasswordToken -resetPasswordExpire'
    );

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get client analytics
// @route   GET /api/clients/analytics
// @access  Private (Client only)
exports.getAnalytics = async (req, res, next) => {
  try {
    // Parse date range from query parameters
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(0);
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date();

    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);

    // Base query for date filtering
    const dateQuery = {
      client: req.user.id,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    // Get total number of projects
    const totalProjects = await Project.countDocuments({
      ...dateQuery,
    });

    // Get projects by status
    const openProjects = await Project.countDocuments({
      ...dateQuery,
      status: 'open',
    });

    const inProgressProjects = await Project.countDocuments({
      ...dateQuery,
      status: 'in-progress',
    });

    const completedProjects = await Project.countDocuments({
      ...dateQuery,
      status: 'completed',
    });

    const cancelledProjects = await Project.countDocuments({
      ...dateQuery,
      status: 'cancelled',
    });

    // Get total number of reviews given
    const totalReviews = await Review.countDocuments({
      client: req.user.id,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    // Get average rating given
    const reviews = await Review.find({
      client: req.user.id,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const averageRatingGiven =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    // Get total budget spent
    const completedProjectsData = await Project.find({
      ...dateQuery,
      status: 'completed',
    });

    const totalBudgetSpent = completedProjectsData.reduce(
      (sum, project) => sum + project.budget,
      0
    );

    // Get recent projects
    const recentProjects = await Project.find({ client: req.user.id })
      .sort('-createdAt')
      .limit(5)
      .populate({
        path: 'freelancer',
        select: 'name email',
      });

    // Get projects over time (monthly)
    const projectsOverTime = await Project.aggregate([
      {
        $match: {
          client: new mongoose.Types.ObjectId(req.user.id),
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Format projects over time data for chart
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const projectsOverTimeData = {
      labels: projectsOverTime.map(
        (item) => `${months[item._id.month - 1]} ${item._id.year}`
      ),
      data: projectsOverTime.map((item) => item.count),
    };

    // Get budget by category
    const projectsByCategory = await Project.aggregate([
      {
        $match: {
          client: new mongoose.Types.ObjectId(req.user.id),
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: '$category',
          totalBudget: { $sum: '$budget' },
        },
      },
      {
        $sort: { totalBudget: -1 },
      },
    ]);

    // Format budget by category data for chart
    const budgetByCategoryData = {
      labels: projectsByCategory.map((item) => item._id || 'Uncategorized'),
      data: projectsByCategory.map((item) => item.totalBudget),
    };

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        projectsByStatus: {
          open: openProjects,
          inProgress: inProgressProjects,
          completed: completedProjects,
          cancelled: cancelledProjects,
        },
        totalReviews,
        averageRatingGiven,
        totalBudgetSpent,
        recentProjects,
        projectsOverTime: projectsOverTimeData,
        budgetByCategory: budgetByCategoryData,
      },
    });
  } catch (err) {
    console.error('Error in client analytics:', err);
    next(err);
  }
};

// @desc    Get client by ID
// @route   GET /api/clients/:id
// @access  Public
exports.getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id).select(
      'name email company website location bio'
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (err) {
    next(err);
  }
};
