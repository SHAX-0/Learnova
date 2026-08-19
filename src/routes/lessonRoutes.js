const express = require('express');
const router = express.Router({ mergeParams: true });

const { createLesson, getLessons, updateLesson, deleteLesson } = require('../controllers/lessonController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, authorize('Instructor'), createLesson)
    .get(protect, getLessons);

router.route('/:lessonId')
    .put(protect, authorize('Instructor'), updateLesson)
    .delete(protect, authorize('Instructor'), deleteLesson);

module.exports = router;