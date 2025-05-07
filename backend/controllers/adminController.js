const User = require('../models/User');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');
const Project = require('../models/Project');
const Bid = require('../models/Bid');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getPlatformStats = async (req, res, next) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const totalClients = await Client.countDocuments();
    const totalFreelancers = await Freelancer.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    // Project statistics
    const totalProjects = await Project.countDocuments();
    const openProjects = await Project.countDocuments({ status: 'open' });
    const inProgressProjects = await Project.countDocuments({ status: 'in-progress' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const cancelledProjects = await Project.countDocuments({ status: 'cancelled' });
    
    // Bid statistics
    const totalBids = await Bid.countDocuments();
    const pendingBids = await Bid.countDocuments({ status: 'pending' });
    const acceptedBids = await Bid.countDocuments({ status: 'accepted' });
    const rejectedBids = await Bid.countDocuments({ status: 'rejected' });
    const counteredBids = await Bid.countDocuments({ status: 'countered' });
    
    // Review statistics
    const totalReviews = await Review.countDocuments();
    const averageRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);
    
    // Calculate total project value
    const projectValues = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$budget' }
        }
      }
    ]);
    
    // Get recent users
    const recentUsers = await User.find()
      .sort('-createdAt')
      .limit(5)
      .select('name email role createdAt');
    
    // Get recent projects
    const recentProjects = await Project.find()
      .sort('-createdAt')
      .limit(5)
      .populate({
        path: 'client',
        select: 'name email'
      })
      .populate({
        path: 'freelancer',
        select: 'name email'
      });
    
    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          clients: totalClients,
          freelancers: totalFreelancers,
          admins: totalAdmins
        },
        projects: {
          total: totalProjects,
          open: openProjects,
          inProgress: inProgressProjects,
          completed: completedProjects,
          cancelled: cancelledProjects,
          totalValue: projectValues.length > 0 ? projectValues[0].totalValue : 0
        },
        bids: {
          total: totalBids,
          pending: pendingBids,
          accepted: acceptedBids,
          rejected: rejectedBids,
          countered: counteredBids
        },
        reviews: {
          total: totalReviews,
          averageRating: averageRating.length > 0 ? averageRating[0].averageRating : 0
        },
        recent: {
          users: recentUsers,
          projects: recentProjects
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password -verificationToken -verificationExpire -resetPasswordToken -resetPasswordExpire')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -verificationToken -verificationExpire -resetPasswordToken -resetPasswordExpire');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
exports.updateUser = async (req, res, next) => {
  try {
    // Fields to update
    const fieldsToUpdate = {};
    
    // Basic fields
    if (req.body.name) fieldsToUpdate.name = req.body.name;
    if (req.body.email) fieldsToUpdate.email = req.body.email;
    if (req.body.role) fieldsToUpdate.role = req.body.role;
    if (req.body.isVerified !== undefined) fieldsToUpdate.isVerified = req.body.isVerified;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password -verificationToken -verificationExpire -resetPasswordToken -resetPasswordExpire');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if user is an admin
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete admin user'
      });
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get pending verification documents
// @route   GET /api/admin/verifications
// @access  Private (Admin only)
exports.getPendingVerifications = async (req, res, next) => {
  try {
    const freelancers = await Freelancer.find({
      'verificationDocuments.status': 'Pending'
    }).select('name email verificationDocuments');
    
    res.status(200).json({
      success: true,
      count: freelancers.length,
      data: freelancers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update verification status
// @route   PUT /api/admin/verifications/:freelancerId/:documentId
// @access  Private (Admin only)
exports.updateVerificationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid status (Approved or Rejected)'
      });
    }
    
    const freelancer = await Freelancer.findById(req.params.freelancerId);
    
    if (!freelancer) {
      return res.status(404).json({
        success: false,
        error: 'Freelancer not found'
      });
    }
    
    // Find the document
    const document = freelancer.verificationDocuments.id(req.params.documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    // Update document status
    document.status = status;
    
    // If document is approved, update freelancer verification status
    if (status === 'Approved') {
      // Check if all documents are approved
      const allApproved = freelancer.verificationDocuments.every(
        doc => doc.status === 'Approved'
      );
      
      if (allApproved) {
        freelancer.verified = true;
        freelancer.verificationLevel = 'Verified';
      }
    }
    
    await freelancer.save();
    
    // Create notification for freelancer
    await Notification.create({
      recipient: freelancer._id,
      sender: req.user.id,
      type: 'verification-status',
      title: 'Verification Status Update',
      message: `Your verification document has been ${status.toLowerCase()}.`,
    });
    
    res.status(200).json({
      success: true,
      data: freelancer
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all projects
// @route   GET /api/admin/projects
// @access  Private (Admin only)
exports.getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate({
        path: 'client',
        select: 'name email'
      })
      .populate({
        path: 'freelancer',
        select: 'name email'
      })
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get project by ID
// @route   GET /api/admin/projects/:id
// @access  Private (Admin only)
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({
        path: 'client',
        select: 'name email'
      })
      .populate({
        path: 'freelancer',
        select: 'name email'
      })
      .populate({
        path: 'bids',
        populate: {
          path: 'freelancer',
          select: 'name email'
        }
      });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update project
// @route   PUT /api/admin/projects/:id
// @access  Private (Admin only)
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete project
// @route   DELETE /api/admin/projects/:id
// @access  Private (Admin only)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    await project.deleteOne();
    
    // Remove project from client's projects
    await Client.findByIdAndUpdate(project.client, {
      $pull: { projects: project._id }
    });
    
    // If project has a freelancer, remove from freelancer's projects
    if (project.freelancer) {
      await Freelancer.findByIdAndUpdate(project.freelancer, {
        $pull: { 
          activeProjects: project._id,
          completedProjects: project._id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
