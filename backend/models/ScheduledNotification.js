const mongoose = require('mongoose');

const ScheduledNotificationSchema = new mongoose.Schema({
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NotificationTemplate',
    required: [true, 'Please specify a notification template']
  },
  recipients: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one recipient is required'
    }
  },
  recipientFilter: {
    role: {
      type: String,
      enum: ['client', 'freelancer', 'admin', 'all']
    },
    verificationLevel: {
      type: String,
      enum: ['Basic', 'Verified', 'Premium', 'all']
    },
    location: String,
    customQuery: Object // For storing complex MongoDB queries
  },
  variables: {
    type: Object,
    default: {}
  },
  scheduledFor: {
    type: Date,
    required: [true, 'Please specify when the notification should be sent']
  },
  repeat: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none'
  },
  status: {
    type: String,
    enum: ['scheduled', 'sent', 'failed', 'cancelled'],
    default: 'scheduled'
  },
  sentAt: {
    type: Date
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
ScheduledNotificationSchema.index({ status: 1, scheduledFor: 1 });
ScheduledNotificationSchema.index({ createdBy: 1 });

module.exports = mongoose.model('ScheduledNotification', ScheduledNotificationSchema);
