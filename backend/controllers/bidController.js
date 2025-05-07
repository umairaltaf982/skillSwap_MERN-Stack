const Bid = require('../models/Bid');
const Project = require('../models/Project');
const Freelancer = require('../models/Freelancer');
const Notification = require('../models/Notification');

// @desc    Get all bids for a project
// @route   GET /api/projects/:projectId/bids
// @access  Private (Client only)
exports.getBidsForProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Make sure user is project owner or admin
    if (project.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to view bids for this project'
      });
    }

    const bids = await Bid.find({ project: req.params.projectId })
      .populate({
        path: 'freelancer',
        select: 'name email skills averageRating'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single bid
// @route   GET /api/bids/:id
// @access  Private (Client/Freelancer)
exports.getBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate({
        path: 'freelancer',
        select: 'name email skills averageRating'
      })
      .populate({
        path: 'project',
        select: 'title description client'
      });

    if (!bid) {
      return res.status(404).json({
        success: false,
        error: 'Bid not found'
      });
    }

    // Make sure user is project owner, bid owner, or admin
    const project = await Project.findById(bid.project);
    
    if (
      project.client.toString() !== req.user.id && 
      bid.freelancer._id.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to view this bid'
      });
    }

    res.status(200).json({
      success: true,
      data: bid
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a bid
// @route   POST /api/projects/:projectId/bids
// @access  Private (Freelancer only)
exports.createBid = async (req, res, next) => {
  try {
    // Add project and freelancer to req.body
    req.body.project = req.params.projectId;
    req.body.freelancer = req.user.id;

    // Check if project exists
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if project is open for bidding
    if (project.status !== 'open') {
      return res.status(400).json({
        success: false,
        error: 'Project is not open for bidding'
      });
    }

    // Check if freelancer has already bid on this project
    const existingBid = await Bid.findOne({
      project: req.params.projectId,
      freelancer: req.user.id
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        error: 'You have already bid on this project'
      });
    }

    // Create bid
    const bid = await Bid.create(req.body);

    // Add bid to project's bids
    await Project.findByIdAndUpdate(req.params.projectId, {
      $push: { bids: bid._id }
    });

    // Add bid to freelancer's bids
    await Freelancer.findByIdAndUpdate(req.user.id, {
      $push: { bids: bid._id }
    });

    // Create notification for project owner
    await Notification.create({
      recipient: project.client,
      sender: req.user.id,
      type: 'new-bid',
      title: 'New Bid Received',
      message: `You have received a new bid on your project "${project.title}".`,
      relatedProject: project._id,
      relatedBid: bid._id
    });

    // Emit socket event for real-time updates
    // This will be handled by the socket.io implementation in server.js
    req.io?.to(`project_${project._id}`).emit('new-bid', {
      bid,
      project: project._id
    });

    res.status(201).json({
      success: true,
      data: bid
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a bid
// @route   PUT /api/bids/:id
// @access  Private (Freelancer only)
exports.updateBid = async (req, res, next) => {
  try {
    let bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        success: false,
        error: 'Bid not found'
      });
    }

    // Make sure user is bid owner
    if (bid.freelancer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this bid'
      });
    }

    // Check if bid can be updated
    if (bid.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update a bid that is not pending'
      });
    }

    // Update bid
    bid = await Bid.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Get project for notification
    const project = await Project.findById(bid.project);

    // Create notification for project owner
    await Notification.create({
      recipient: project.client,
      sender: req.user.id,
      type: 'new-bid',
      title: 'Bid Updated',
      message: `A bid on your project "${project.title}" has been updated.`,
      relatedProject: project._id,
      relatedBid: bid._id
    });

    // Emit socket event for real-time updates
    req.io?.to(`project_${project._id}`).emit('bid-updated', {
      bid,
      project: project._id
    });

    res.status(200).json({
      success: true,
      data: bid
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a bid
// @route   DELETE /api/bids/:id
// @access  Private (Freelancer only)
exports.deleteBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        success: false,
        error: 'Bid not found'
      });
    }

    // Make sure user is bid owner
    if (bid.freelancer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this bid'
      });
    }

    // Check if bid can be deleted
    if (bid.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete a bid that is not pending'
      });
    }

    // Get project for notification and socket event
    const project = await Project.findById(bid.project);

    await bid.deleteOne();

    // Remove bid from project's bids
    await Project.findByIdAndUpdate(bid.project, {
      $pull: { bids: bid._id }
    });

    // Remove bid from freelancer's bids
    await Freelancer.findByIdAndUpdate(req.user.id, {
      $pull: { bids: bid._id }
    });

    // Create notification for project owner
    await Notification.create({
      recipient: project.client,
      sender: req.user.id,
      type: 'new-bid',
      title: 'Bid Withdrawn',
      message: `A bid on your project "${project.title}" has been withdrawn.`,
      relatedProject: project._id
    });

    // Emit socket event for real-time updates
    req.io?.to(`project_${project._id}`).emit('bid-deleted', {
      bidId: bid._id,
      project: project._id
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept a bid
// @route   PUT /api/bids/:id/accept
// @access  Private (Client only)
exports.acceptBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        success: false,
        error: 'Bid not found'
      });
    }

    // Get project
    const project = await Project.findById(bid.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Make sure user is project owner
    if (project.client.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to accept bids for this project'
      });
    }

    // Check if project already has a freelancer
    if (project.freelancer) {
      return res.status(400).json({
        success: false,
        error: 'Project already has a freelancer assigned'
      });
    }

    // Check if project is open
    if (project.status !== 'open') {
      return res.status(400).json({
        success: false,
        error: 'Project is not open for bidding'
      });
    }

    // Update bid status
    await Bid.findByIdAndUpdate(req.params.id, { status: 'accepted' });

    // Update project with freelancer and status
    await Project.findByIdAndUpdate(bid.project, {
      freelancer: bid.freelancer,
      status: 'in-progress'
    });

    // Add project to freelancer's active projects
    await Freelancer.findByIdAndUpdate(bid.freelancer, {
      $push: { activeProjects: bid.project }
    });

    // Create notification for freelancer
    await Notification.create({
      recipient: bid.freelancer,
      sender: req.user.id,
      type: 'bid-accepted',
      title: 'Bid Accepted',
      message: `Your bid on the project "${project.title}" has been accepted.`,
      relatedProject: project._id,
      relatedBid: bid._id
    });

    // Emit socket event for real-time updates
    req.io?.to(`project_${project._id}`).emit('bid-accepted', {
      bid,
      project: project._id
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'Bid accepted successfully'
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject a bid
// @route   PUT /api/bids/:id/reject
// @access  Private (Client only)
exports.rejectBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        success: false,
        error: 'Bid not found'
      });
    }

    // Get project
    const project = await Project.findById(bid.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Make sure user is project owner
    if (project.client.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to reject bids for this project'
      });
    }

    // Update bid status
    await Bid.findByIdAndUpdate(req.params.id, { status: 'rejected' });

    // Create notification for freelancer
    await Notification.create({
      recipient: bid.freelancer,
      sender: req.user.id,
      type: 'bid-rejected',
      title: 'Bid Rejected',
      message: `Your bid on the project "${project.title}" has been rejected.`,
      relatedProject: project._id,
      relatedBid: bid._id
    });

    // Emit socket event for real-time updates
    req.io?.to(`project_${project._id}`).emit('bid-rejected', {
      bid,
      project: project._id
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'Bid rejected successfully'
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Counter offer on a bid
// @route   PUT /api/bids/:id/counter
// @access  Private (Client only)
exports.counterBid = async (req, res, next) => {
  try {
    const { amount, deliveryTime, message } = req.body;

    if (!amount || !deliveryTime || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide amount, delivery time, and message for counter offer'
      });
    }

    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        success: false,
        error: 'Bid not found'
      });
    }

    // Get project
    const project = await Project.findById(bid.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Make sure user is project owner
    if (project.client.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to counter bids for this project'
      });
    }

    // Update bid status and counter offer
    const updatedBid = await Bid.findByIdAndUpdate(
      req.params.id,
      {
        status: 'countered',
        counterOffer: {
          amount,
          deliveryTime,
          message
        }
      },
      { new: true }
    );

    // Create notification for freelancer
    await Notification.create({
      recipient: bid.freelancer,
      sender: req.user.id,
      type: 'counter-offer',
      title: 'Counter Offer Received',
      message: `You have received a counter offer on your bid for the project "${project.title}".`,
      relatedProject: project._id,
      relatedBid: bid._id
    });

    // Emit socket event for real-time updates
    req.io?.to(`project_${project._id}`).emit('bid-countered', {
      bid: updatedBid,
      project: project._id
    });

    res.status(200).json({
      success: true,
      data: updatedBid
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept counter offer
// @route   PUT /api/bids/:id/accept-counter
// @access  Private (Freelancer only)
exports.acceptCounterOffer = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        success: false,
        error: 'Bid not found'
      });
    }

    // Make sure user is bid owner
    if (bid.freelancer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to accept counter offers for this bid'
      });
    }

    // Check if bid has a counter offer
    if (bid.status !== 'countered' || !bid.counterOffer) {
      return res.status(400).json({
        success: false,
        error: 'This bid does not have a counter offer'
      });
    }

    // Get project
    const project = await Project.findById(bid.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if project already has a freelancer
    if (project.freelancer) {
      return res.status(400).json({
        success: false,
        error: 'Project already has a freelancer assigned'
      });
    }

    // Update bid with counter offer values and status
    const updatedBid = await Bid.findByIdAndUpdate(
      req.params.id,
      {
        status: 'accepted',
        amount: bid.counterOffer.amount,
        deliveryTime: bid.counterOffer.deliveryTime
      },
      { new: true }
    );

    // Update project with freelancer and status
    await Project.findByIdAndUpdate(bid.project, {
      freelancer: bid.freelancer,
      status: 'in-progress'
    });

    // Add project to freelancer's active projects
    await Freelancer.findByIdAndUpdate(bid.freelancer, {
      $push: { activeProjects: bid.project }
    });

    // Create notification for client
    await Notification.create({
      recipient: project.client,
      sender: req.user.id,
      type: 'bid-accepted',
      title: 'Counter Offer Accepted',
      message: `Your counter offer for the project "${project.title}" has been accepted.`,
      relatedProject: project._id,
      relatedBid: bid._id
    });

    // Emit socket event for real-time updates
    req.io?.to(`project_${project._id}`).emit('counter-accepted', {
      bid: updatedBid,
      project: project._id
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'Counter offer accepted successfully'
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bids for current freelancer
// @route   GET /api/bids/me
// @access  Private (Freelancer only)
exports.getMyBids = async (req, res, next) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({
        success: false,
        error: 'Only freelancers can access this route'
      });
    }

    const bids = await Bid.find({ freelancer: req.user.id })
      .populate({
        path: 'project',
        select: 'title description budget deadline status client',
        populate: {
          path: 'client',
          select: 'name email'
        }
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (err) {
    next(err);
  }
};
