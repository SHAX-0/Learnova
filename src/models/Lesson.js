const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Lesson must belong to a course'],
    },
    order: {
      type: Number,
      required: [true, 'Lesson order is required'],
      min: 1,
    },
    content: {
      type: {
        type: String,
        enum: ['video', 'pdf', 'text', 'link'],
        default: 'text',
      },
      url: {
        type: String,
        trim: true,
      },
    },
    isFree: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

lessonSchema.index({ course: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Lesson', lessonSchema);