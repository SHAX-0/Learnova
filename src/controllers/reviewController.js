const Review = require('../models/Review');
const Course = require('../models/courseModel');
const Enrollment = require('../models/Enrollment');

exports.addReview = async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
    });
    if (!enrollment) {
      return res
        .status(403)
        .json({ message: 'You must be enrolled in this course to review it' });
    }

    const review = await Review.create({
      student: req.user.id,
      course: courseId,
      rating,
      comment,
    });

    await review.populate('course', 'title');

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'You have already reviewed this course' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const reviews = await Review.find({ course: courseId })
      .populate('student', 'name')
      .sort({ createdAt: -1 });

    const averageRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.student.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You are not allowed to update this review' });
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.student.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You are not allowed to delete this review' });
    }

    await review.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};