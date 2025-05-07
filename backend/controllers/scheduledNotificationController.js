const ScheduledNotification = require('../models/ScheduledNotification');
const User = require('../models/User');

// @desc    Get all scheduled notifications
// @route   GET /api/admin/scheduled-notifications
// @access  Private (Admin only)
exports.getScheduledNotifications = async (req, res, next) => {
  try {
    const { status, template } = req.query;
    
    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (template) query.template = template;
    
    const notifications = await ScheduledNotification.find(query)
      .populate('template', 'name type category')
      .populate('createdBy', 'name')
      .sort({ scheduledFor: 1 });
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single scheduled notification
// @route   GET /api/admin/scheduled-notifications/:id
// @access  Private (Admin only)
exports.getScheduledNotification = async (req, res, next) => {
  try {
    const notification = await ScheduledNotification.findById(req.params.id)
      .populate('template')
      .populate('createdBy', 'name')
      .populate('recipients', 'name email');
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create scheduled notification
// @route   POST /api/admin/scheduled-notifications
// @access  Private (Admin only)
exports.createScheduledNotification = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;
    
    // If recipientFilter is provided, find matching users
    if (req.body.recipientFilter && !req.body.recipients) {
      const filter = {};
      
      if (req.body.recipientFilter.role && req.body.recipientFilter.role !== 'all') {
        filter.role = req.body.recipientFilter.role;
      }
      
      // Add more filter conditions as needed
      
      const users = await User.find(filter).select('_id');
      req.body.recipients = users.map(user => user._id);
    }
    
    const notification = await ScheduledNotification.create(req.body);
    
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update scheduled notification
// @route   PUT /api/admin/scheduled-notifications/:id
// @access  Private (Admin only)
exports.updateScheduledNotification = async (req, res, next) => {
  try {
    // Add updatedBy to req.body
    req.body.updatedBy = req.user.id;
    
    let notification = await ScheduledNotification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled notification not found'
      });
    }
    
    // Don't allow updates if already sent
    if (notification.status === 'sent') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update a notification that has already been sent'
      });
    }
    
    notification = await ScheduledNotification.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel scheduled notification
// @route   PUT /api/admin/scheduled-notifications/:id/cancel
// @access  Private (Admin only)
exports.cancelScheduledNotification = async (req, res, next) => {
  try {
    const notification = await ScheduledNotification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled notification not found'
      });
    }
    
    // Don't allow cancellation if already sent
    if (notification.status === 'sent') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel a notification that has already been sent'
      });
    }
    
    notification.status = 'cancelled';
    notification.updatedBy = req.user.id;
    
    await notification.save();
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete scheduled notification
// @route   DELETE /api/admin/scheduled-notifications/:id
// @access  Private (Admin only)
exports.deleteScheduledNotification = async (req, res, next) => {
  try {
    const notification = await ScheduledNotification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled notification not found'
      });
    }
    
    await notification.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
