const mongoose = require('mongoose');

const answerRecordSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    selectedOption: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false }
);

const quizResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Result must belong to a student'],
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Result must belong to a quiz'],
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    answers: {
      type: [answerRecordSchema],
      required: true,
    },
  },
  { timestamps: true }
);

quizResultSchema.index({ student: 1, quiz: 1 }, { unique: true });

module.exports = mongoose.model('QuizResult', quizResultSchema);