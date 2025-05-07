const Freelancer = require('../models/Freelancer');
const Review = require('../models/Review');
const { getFreelancerReviews } = require('./reviewController');

// @desc    Get freelancer profile
// @route   GET /api/freelancers/profile
// @access  Private (Freelancer only)
exports.getProfile = async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findById(req.user.id).select(
      '-password -verificationToken -verificationExpire -resetPasswordToken -resetPasswordExpire'
    );

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        error: 'Freelancer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: freelancer,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all freelancers
// @route   GET /api/freelancers
// @access  Public
exports.getFreelancers = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Finding resource
    let query = Freelancer.find(JSON.parse(queryStr)).select(
      '-password -verificationToken -verificationExpire -resetPasswordToken -resetPasswordExpire'
    );

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-averageRating');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Freelancer.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const freelancers = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: freelancers.length,
      pagination,
      data: freelancers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single freelancer
// @route   GET /api/freelancers/:id
// @access  Public
exports.getFreelancer = async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id)
      .select(
        '-password -verificationToken -verificationExpire -resetPasswordToken -resetPasswordExpire'
      )
      .populate({
        path: 'completedProjects',
        select: 'title description category budget status',
      })
      .populate({
        path: 'activeProjects',
        select: 'title description category budget status',
      });

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        error: 'Freelancer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: freelancer,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update freelancer profile
// @route   PUT /api/freelancers/profile
// @access  Private (Freelancer only)
exports.updateProfile = async (req, res, next) => {
  try {
    // Fields to update
    const fieldsToUpdate = {};

    // Basic fields
    if (req.body.bio) fieldsToUpdate.bio = req.body.bio;
    if (req.body.hourlyRate) fieldsToUpdate.hourlyRate = req.body.hourlyRate;
    if (req.body.availability)
      fieldsToUpdate.availability = req.body.availability;
    if (req.body.location) fieldsToUpdate.location = req.body.location;

    // Skills
    if (req.body.skills && Array.isArray(req.body.skills)) {
      fieldsToUpdate.skills = req.body.skills;
    }

    // Portfolio
    if (req.body.portfolio && Array.isArray(req.body.portfolio)) {
      fieldsToUpdate.portfolio = req.body.portfolio;
    }

    // Education
    if (req.body.education && Array.isArray(req.body.education)) {
      fieldsToUpdate.education = req.body.education;
    }

    // Experience
    if (req.body.experience && Array.isArray(req.body.experience)) {
      fieldsToUpdate.experience = req.body.experience;
    }

    // Update freelancer profile
    const freelancer = await Freelancer.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    ).select(
      '-password -verificationToken -verificationExpire -resetPasswordToken -resetPasswordExpire'
    );

    res.status(200).json({
      success: true,
      data: freelancer,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add portfolio item
// @route   POST /api/freelancers/portfolio
// @access  Private (Freelancer only)
exports.addPortfolioItem = async (req, res, next) => {
  try {
    const { title, description, imageUrl, projectUrl } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title and description',
      });
    }

    const freelancer = await Freelancer.findById(req.user.id);

    freelancer.portfolio.unshift({
      title,
      description,
      imageUrl,
      projectUrl,
    });

    await freelancer.save();

    res.status(200).json({
      success: true,
      data: freelancer.portfolio,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete portfolio item
// @route   DELETE /api/freelancers/portfolio/:id
// @access  Private (Freelancer only)
exports.deletePortfolioItem = async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findById(req.user.id);

    // Get remove index
    const removeIndex = freelancer.portfolio
      .map((item) => item.id)
      .indexOf(req.params.id);

    if (removeIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio item not found',
      });
    }

    // Remove portfolio item
    freelancer.portfolio.splice(removeIndex, 1);

    await freelancer.save();

    res.status(200).json({
      success: true,
      data: freelancer.portfolio,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add education
// @route   POST /api/freelancers/education
// @access  Private (Freelancer only)
exports.addEducation = async (req, res, next) => {
  try {
    const {
      institution,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description,
    } = req.body;

    if (!institution || !degree || !from) {
      return res.status(400).json({
        success: false,
        error: 'Please provide institution, degree, and from date',
      });
    }

    const freelancer = await Freelancer.findById(req.user.id);

    freelancer.education.unshift({
      institution,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description,
    });

    await freelancer.save();

    res.status(200).json({
      success: true,
      data: freelancer.education,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete education
// @route   DELETE /api/freelancers/education/:id
// @access  Private (Freelancer only)
exports.deleteEducation = async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findById(req.user.id);

    // Get remove index
    const removeIndex = freelancer.education
      .map((item) => item.id)
      .indexOf(req.params.id);

    if (removeIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Education not found',
      });
    }

    // Remove education
    freelancer.education.splice(removeIndex, 1);

    await freelancer.save();

    res.status(200).json({
      success: true,
      data: freelancer.education,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add experience
// @route   POST /api/freelancers/experience
// @access  Private (Freelancer only)
exports.addExperience = async (req, res, next) => {
  try {
    const { title, company, location, from, to, current, description } =
      req.body;

    if (!title || !company || !from) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title, company, and from date',
      });
    }

    const freelancer = await Freelancer.findById(req.user.id);

    freelancer.experience.unshift({
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    });

    await freelancer.save();

    res.status(200).json({
      success: true,
      data: freelancer.experience,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete experience
// @route   DELETE /api/freelancers/experience/:id
// @access  Private (Freelancer only)
exports.deleteExperience = async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findById(req.user.id);

    // Get remove index
    const removeIndex = freelancer.experience
      .map((item) => item.id)
      .indexOf(req.params.id);

    if (removeIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Experience not found',
      });
    }

    // Remove experience
    freelancer.experience.splice(removeIndex, 1);

    await freelancer.save();

    res.status(200).json({
      success: true,
      data: freelancer.experience,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload verification document
// @route   POST /api/freelancers/verification
// @access  Private (Freelancer only)
exports.uploadVerificationDocument = async (req, res, next) => {
  try {
    const { documentType, documentUrl } = req.body;

    if (!documentType || !documentUrl) {
      return res.status(400).json({
        success: false,
        error: 'Please provide document type and URL',
      });
    }

    const freelancer = await Freelancer.findById(req.user.id);

    freelancer.verificationDocuments.push({
      documentType,
      documentUrl,
      status: 'Pending',
    });

    await freelancer.save();

    res.status(200).json({
      success: true,
      data: freelancer.verificationDocuments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get freelancer analytics
// @route   GET /api/freelancers/analytics
// @access  Private (Freelancer only)
exports.getAnalytics = async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findById(req.user.id);

    // Get total number of bids
    const totalBids = freelancer.bids.length;

    // Get total number of active projects
    const totalActiveProjects = freelancer.activeProjects.length;

    // Get total number of completed projects
    const totalCompletedProjects = freelancer.completedProjects.length;

    // Get average rating
    const averageRating = freelancer.averageRating || 0;

    // Get total number of reviews
    const totalReviews = freelancer.reviews.length;

    // Get bid success rate
    const bidSuccessRate =
      totalBids > 0
        ? ((totalActiveProjects + totalCompletedProjects) / totalBids) * 100
        : 0;

    // Get recent reviews
    const recentReviews = await Review.find({ freelancer: req.user.id })
      .sort('-createdAt')
      .limit(5)
      .populate({
        path: 'client',
        select: 'name',
      })
      .populate({
        path: 'project',
        select: 'title',
      });

    res.status(200).json({
      success: true,
      data: {
        totalBids,
        totalActiveProjects,
        totalCompletedProjects,
        averageRating,
        totalReviews,
        bidSuccessRate,
        recentReviews,
      },
    });
  } catch (err) {
    next(err);
  }
};
