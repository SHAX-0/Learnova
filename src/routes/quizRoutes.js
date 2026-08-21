const express = require('express');
const router = express.Router();

const {
  createQuiz,
  getQuizByCourse,
  submitQuiz,
  getResults,
} = require('../controllers/quizController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, authorize('Instructor'), createQuiz);

router.route('/results/:userId')
    .get(protect, getResults);

router.route('/:courseId')
    .get(protect, getQuizByCourse);

router.route('/:id/submit')
    .post(protect, authorize('Student'), submitQuiz);

module.exports = router;