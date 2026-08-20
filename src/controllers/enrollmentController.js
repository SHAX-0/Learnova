const Enrollment = require('../models/Enrollment');
const Course = require('../models/courseModel');


exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // 1. تأكدي إن الكورس موجود أصلاً
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 2. إنشاء الـ enrollment
    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId,
    });

    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    // لو الـ unique index بتاع (student + course) اتكسر
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'You are already enrolled in this course' });
    }
    res.status(500).json({ message: error.message });
  }
};


exports.getMyEnrollments = async (req, res) => {
  try {
    // req.user.id جاي من التوكن بعد الـ protect middleware
    // مش من req.params — عشان محدش يقدر يشوف enrollments طالب تاني
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate('course', 'title description price instructor')
      .sort({ enrolledAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};