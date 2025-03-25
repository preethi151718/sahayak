const mongoose = require('mongoose');

const educatorSchema = new mongoose.Schema({
  educatorId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  experienceYears: Number,
  programs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  }],
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  email: String,
  phoneNo: String
});

module.exports = mongoose.model('Educator', educatorSchema);