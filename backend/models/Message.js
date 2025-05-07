const mongoose = require('mongoose');
const crypto = require('crypto');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Please add a message'],
    maxlength: [5000, 'Message cannot be more than 5000 characters']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  readStatus: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  metadata: {
    type: String // Hashed metadata
  },
  attachments: [{
    name: {
      type: String
    },
    url: {
      type: String
    },
    type: {
      type: String
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash sensitive metadata before saving
MessageSchema.pre('save', function(next) {
  // Create metadata object with sensitive information
  const metadata = {
    senderIP: this._senderIP, // This would be set when creating the message
    userAgent: this._userAgent, // This would be set when creating the message
    timestamp: Date.now()
  };
  
  // Hash the metadata
  this.metadata = crypto
    .createHash('sha256')
    .update(JSON.stringify(metadata))
    .digest('hex');
  
  // Remove temporary properties
  delete this._senderIP;
  delete this._userAgent;
  
  next();
});

// Create conversation index for efficient querying
MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ receiver: 1, readStatus: 1 });

module.exports = mongoose.model('Message', MessageSchema);
