const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Create index for efficient leaderboard queries
scoreSchema.index({ score: -1 });

module.exports = mongoose.model('Score', scoreSchema);