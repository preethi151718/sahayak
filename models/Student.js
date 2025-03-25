const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  status: String,
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  },
  daysOfWeek: [String],
  educator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Educator'
  },
  secondaryEducator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Educator'
  },
  sessionType: {
    type: String,
    enum: ['online', 'offline']
  },
  fatherName: String,
  motherName: String,
  bloodGroup: String,
  contactNo: String,
  alternativeContactNo: String,
  parentEmail: String,
  address: String,
  transport: String,
  comments: String,
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  enrollmentYear: Number
});

// Generate student ID based on enrollment year and program
studentSchema.pre('save', async function(next) {
  if (!this.studentId) {
    const count = await this.constructor.countDocuments({
      enrollmentYear: this.enrollmentYear,
      programId: this.programId
    });
    this.studentId = `${this.enrollmentYear}${this.programId}${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);