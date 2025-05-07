const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [5000, 'Description cannot be more than 5000 characters']
  },
  requirements: {
    type: String,
    required: [true, 'Please add requirements'],
    maxlength: [2000, 'Requirements cannot be more than 2000 characters']
  },
  skills: [{
    type: String,
    required: [true, 'Please add at least one required skill']
  }],
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Web Development',
      'Mobile Development',
      'UI/UX Design',
      'Graphic Design',
      'Content Writing',
      'Digital Marketing',
      'Video Editing',
      'Data Entry',
      'Other'
    ]
  },
  budget: {
    type: Number,
    required: [true, 'Please add a budget']
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a deadline']
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Freelancer'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  bids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  }],
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  },
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'approved'],
      default: 'pending'
    },
    completedAt: {
      type: Date
    },
    approvedAt: {
      type: Date
    }
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with reviews
ProjectSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'project',
  justOne: false
});

// Calculate progress based on milestones
ProjectSchema.pre('save', function(next) {
  if (this.milestones && this.milestones.length > 0) {
    const completedMilestones = this.milestones.filter(
      milestone => milestone.status === 'approved'
    ).length;
    
    this.progress = Math.round((completedMilestones / this.milestones.length) * 100);
    
    // If all milestones are completed, mark project as completed
    if (this.progress === 100 && this.status !== 'completed') {
      this.status = 'completed';
      this.completedAt = Date.now();
    }
  }
  
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);
