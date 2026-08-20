const express = require('express');
const router = express.Router({ mergeParams: true });

const { enrollInCourse, getMyEnrollments } = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/enroll')
    .post(protect, authorize('Student'), enrollInCourse);

router.route('/my-enrollments')
    .get(protect, authorize('Student'), getMyEnrollments);

module.exports = router;