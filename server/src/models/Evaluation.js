const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  results: [{
    path: String,
    method: String,
    requestData: mongoose.Schema.Types.Mixed,
    response: {
      status: Number,
      data: mongoose.Schema.Types.Mixed,
      headers: mongoose.Schema.Types.Mixed
    },
    error: String,
    success: Boolean
  }],
  successRate: {
    type: Number,
    required: true
  },
  totalEndpoints: {
    type: Number,
    required: true
  },
  successfulEndpoints: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Evaluation', evaluationSchema); 