const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  program_id: {
    type: String,
    required: true,
    unique: true
  },
  programName: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  weekly: [{
    week: Number,
    name: String
  }],
  monthly: [{
    month: String,
    name: String
  }],
  quarterly: [{
    quarter: String,
    name: String
  }]
});

module.exports = mongoose.model('Program', programSchema);