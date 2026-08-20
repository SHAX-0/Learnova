const express = require('express');
const router = express.Router();

const {
  addReview,
  getCourseReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, authorize('Student'), addReview);

router.route('/:courseId')
    .get(getCourseReviews);

router.route('/:id')
    .put(protect, authorize('Student'), updateReview)
    .delete(protect, authorize('Student'), deleteReview);

module.exports = router;