const NotificationTemplate = require('../models/NotificationTemplate');

// @desc    Get all notification templates
// @route   GET /api/admin/notification-templates
// @access  Private (Admin only)
exports.getNotificationTemplates = async (req, res, next) => {
  try {
    const { type, category, isActive } = req.query;
    
    // Build query
    const query = {};
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const templates = await NotificationTemplate.find(query)
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single notification template
// @route   GET /api/admin/notification-templates/:id
// @access  Private (Admin only)
exports.getNotificationTemplate = async (req, res, next) => {
  try {
    const template = await NotificationTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create notification template
// @route   POST /api/admin/notification-templates
// @access  Private (Admin only)
exports.createNotificationTemplate = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;
    
    const template = await NotificationTemplate.create(req.body);
    
    res.status(201).json({
      success: true,
      data: template
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update notification template
// @route   PUT /api/admin/notification-templates/:id
// @access  Private (Admin only)
exports.updateNotificationTemplate = async (req, res, next) => {
  try {
    // Add updatedBy to req.body
    req.body.updatedBy = req.user.id;
    
    let template = await NotificationTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    template = await NotificationTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete notification template
// @route   DELETE /api/admin/notification-templates/:id
// @access  Private (Admin only)
exports.deleteNotificationTemplate = async (req, res, next) => {
  try {
    const template = await NotificationTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    await template.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
