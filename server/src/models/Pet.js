const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  tag: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pet', petSchema); 