const mongoose = require('mongoose');
const crypto = require('crypto');

const ContractSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Freelancer',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  terms: {
    type: String,
    required: [true, 'Please add contract terms'],
    maxlength: [10000, 'Terms cannot be more than 10000 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please add contract amount']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  paymentTerms: {
    type: String,
    required: [true, 'Please add payment terms']
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
    }
  }],
  signatures: {
    client: {
      signed: {
        type: Boolean,
        default: false
      },
      date: {
        type: Date
      }
    },
    freelancer: {
      signed: {
        type: Boolean,
        default: false
      },
      date: {
        type: Date
      }
    }
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'completed', 'terminated'],
    default: 'draft'
  },
  hash: {
    type: String
  },
  versions: [{
    terms: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    hash: {
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

// Generate hash for contract terms
ContractSchema.pre('save', function(next) {
  // Only hash if terms are modified or it's a new contract
  if (this.isModified('terms') || this.isNew) {
    // Create SHA-256 hash of contract terms
    this.hash = crypto
      .createHash('sha256')
      .update(this.terms)
      .digest('hex');
    
    // Add current version to versions array
    if (this.isModified('terms') && !this.isNew) {
      this.versions.push({
        terms: this.terms,
        hash: this.hash
      });
    }
  }
  
  // Update status based on signatures
  if (this.signatures.client.signed && this.signatures.freelancer.signed) {
    this.status = 'active';
  }
  
  next();
});

module.exports = mongoose.model('Contract', ContractSchema);
