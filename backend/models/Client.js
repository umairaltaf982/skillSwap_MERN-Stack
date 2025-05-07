const mongoose = require('mongoose');
const User = require('./User');

const ClientSchema = new mongoose.Schema({
  company: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL with HTTP or HTTPS',
    ],
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
  },
  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  contracts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
    },
  ],
});

const Client = User.discriminator('Client', ClientSchema);

module.exports = Client;
