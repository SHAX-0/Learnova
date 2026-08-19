const Lesson = require('../models/Lesson');
const Course = require('../models/courseModel');
const Enrollment = require('../models/Enrollment');

// @desc    Create new lesson
// @route   POST /api/courses/:courseId/lessons
// @access  Private (Instructor - owner of the course only)
exports.createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, order, content, isFree } = req.body;

    // 1. تأكدي إن الكورس ده موجود أصلاً
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 2. Ownership check: بس الـ instructor صاحب الكورس يقدر يضيف lesson
    if (course.instructor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You are not allowed to add lessons to this course' });
    }

    // 3. إنشاء الـ lesson
    const lesson = await Lesson.create({
      title,
      description,
      order,
      content,
      isFree,
      course: courseId,
    });

    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    // لو الـ unique index بتاع (course + order) اتكسر
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'This lesson order already exists in this course' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all lessons of a course (content hidden unless free/enrolled/owner)
// @route   GET /api/courses/:courseId/lessons
// @access  Private (any logged-in user)
exports.getLessons = async (req, res) => {
  try {
    const { courseId } = req.params;

    // 1. تأكدي إن الكورس موجود أصلاً
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 2. هاتي كل دروس الكورس ده، مرتبة بالـ order
    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });

    // 3. حددي هل اليوزر ده عنده صلاحية يشوف الـ content الكامل
    let hasFullAccess = false;

    // صاحب الكورس (الـ Instructor) يشوف كل حاجة كاملة دايمًا
    if (course.instructor.toString() === req.user.id) {
      hasFullAccess = true;
    } else {
      // مش الـ owner: نتأكد هل الطالب ده عامل enroll في الكورس ده
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: courseId,
      });
      if (enrollment) {
        hasFullAccess = true;
      }
    }

    // 4. لكل درس: لو عنده full access أو الدرس نفسه isFree، ارجعيه كامل
    //    غير كده، اخفي الـ content وارجعي بس العنوان والمعلومات الأساسية
    const result = lessons.map((lesson) => {
      if (hasFullAccess || lesson.isFree) {
        return lesson;
      }

      return {
        _id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        isFree: lesson.isFree,
        course: lesson.course,
      };
    });

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Update a lesson (owner instructor only)
// @route   PUT /api/courses/:courseId/lessons/:lessonId
// @access  Private (Instructor - owner of the course only)
exports.updateLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { title, description, order, content, isFree } = req.body;

    // 1. تأكدي إن الكورس موجود
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 2. Ownership check: بس صاحب الكورس يعدّل
    if (course.instructor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You are not allowed to update lessons in this course' });
    }

    // 3. تأكدي إن الدرس موجود وتابع للكورس ده تحديدًا
    const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found in this course' });
    }

    // 4. حدّثي بس الحقول اللي جت في الـ body
    if (title !== undefined) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (order !== undefined) lesson.order = order;
    if (content !== undefined) lesson.content = content;
    if (isFree !== undefined) lesson.isFree = isFree;

    await lesson.save();

    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'This lesson order already exists in this course' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You are not allowed to delete lessons in this course' });
    }

    const lesson = await Lesson.findOneAndDelete({ _id: lessonId, course: courseId });
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found in this course' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};