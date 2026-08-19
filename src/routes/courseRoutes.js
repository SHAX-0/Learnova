const express = require('express');
const router = express.Router();
const {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, authorize('Instructor'), createCourse)
    .get(getCourses);

router.route('/:id')
    .get(getCourseById)
    .put(protect, authorize('Instructor', 'Admin'), updateCourse)
    .delete(protect, authorize('Instructor', 'Admin'), deleteCourse);

module.exports = router;
