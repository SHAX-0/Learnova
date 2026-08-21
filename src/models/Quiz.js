const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Option text is required'],
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: {
      type: [optionSchema],
      validate: {
        validator: (opts) => opts.length >= 2,
        message: 'Each question must have at least 2 options',
      },
    },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Quiz must belong to a course'],
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Quiz must have a creator'],
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (qs) => qs.length >= 1,
        message: 'Quiz must have at least 1 question',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);