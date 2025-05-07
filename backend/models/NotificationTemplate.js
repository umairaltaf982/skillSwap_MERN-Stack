const mongoose = require('mongoose');

const NotificationTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a template name'],
    trim: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'in-app'],
    required: [true, 'Please specify the notification type']
  },
  subject: {
    type: String,
    required: function() {
      return this.type === 'email';
    },
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please add template content']
  },
  variables: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  category: {
    type: String,
    enum: [
      'verification',
      'project',
      'payment',
      'system',
      'user'
    ],
    required: [true, 'Please specify a category']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
NotificationTemplateSchema.index({ type: 1, category: 1 });
NotificationTemplateSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('NotificationTemplate', NotificationTemplateSchema);
