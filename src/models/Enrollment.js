const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Enrollment must belong to a student'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Enrollment must belong to a course'],
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// منع نفس الطالب يعمل enroll في نفس الكورس مرتين
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);