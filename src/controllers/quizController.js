const Quiz = require('../models/Quiz');
const Course = require('../models/courseModel');
const Enrollment = require('../models/Enrollment');
const QuizResult = require('../models/QuizResult');

function buildDetailedAnswers(quiz, answers) {
  return answers.map((a) => {
    const question = quiz.questions.id(a.question);
    const selectedOption = question
      ? question.options.id(a.selectedOption)
      : null;

    return {
      questionId: a.question,
      questionText: question ? question.text : null,
      selectedOptionId: a.selectedOption,
      selectedOptionText: selectedOption ? selectedOption.text : null,
      isCorrect: a.isCorrect,
    };
  });
}

exports.createQuiz = async (req, res) => {
  try {
    const { courseId, title, questions } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You are not allowed to add a quiz to this course' });
    }

    const quiz = await Quiz.create({
      title,
      course: courseId,
      createdBy: req.user.id,
      questions,
    });

    await quiz.populate('course', 'title');
    await quiz.populate('createdBy', 'name');

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'This course already has a quiz' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getQuizByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const quiz = await Quiz.findOne({ course: courseId })
      .populate('course', 'title')
      .populate('createdBy', 'name');
    if (!quiz) {
      return res.status(404).json({ message: 'This course has no quiz yet' });
    }

    const isOwner = course.instructor.toString() === req.user.id;

    if (isOwner) {
      return res.status(200).json({ success: true, data: quiz });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
    });
    if (!enrollment) {
      return res
        .status(403)
        .json({ message: 'You must be enrolled in this course to view its quiz' });
    }

    const safeQuiz = {
      _id: quiz._id,
      title: quiz.title,
      course: quiz.course,
      createdBy: quiz.createdBy,
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        text: q.text,
        options: q.options.map((o) => ({
          _id: o._id,
          text: o.text,
        })),
      })),
    };

    res.status(200).json({ success: true, data: safeQuiz });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: quiz.course,
    });
    if (!enrollment) {
      return res
        .status(403)
        .json({ message: 'You must be enrolled in this course to take the quiz' });
    }

    let score = 0;
    const answerRecords = [];

    quiz.questions.forEach((question) => {
      const submitted = answers.find(
        (a) => a.questionId === question._id.toString()
      );

      if (!submitted) {
        return;
      }

      const selectedOption = question.options.id(submitted.selectedOptionId);
      const isCorrect = !!(selectedOption && selectedOption.isCorrect);

      if (isCorrect) {
        score += 1;
      }

      answerRecords.push({
        question: question._id,
        selectedOption: submitted.selectedOptionId,
        isCorrect,
      });
    });

    const result = await QuizResult.create({
      student: req.user.id,
      quiz: quiz._id,
      score,
      totalQuestions: quiz.questions.length,
      answers: answerRecords,
    });

    const detailedResult = {
      _id: result._id,
      student: result.student,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
      },
      score: result.score,
      totalQuestions: result.totalQuestions,
      answers: buildDetailedAnswers(quiz, answerRecords),
      createdAt: result.createdAt,
    };

    res.status(201).json({ success: true, data: detailedResult });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'You have already submitted this quiz' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getResults = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.role !== 'Admin' && req.user.id !== userId) {
      return res
        .status(403)
        .json({ message: 'You are not allowed to view these results' });
    }

    const results = await QuizResult.find({ student: userId })
      .populate({
        path: 'quiz',
        select: 'title course questions',
        populate: { path: 'course', select: 'title' },
      })
      .sort({ createdAt: -1 });

    const detailedResults = results.map((r) => ({
      _id: r._id,
      student: r.student,
      quiz: {
        _id: r.quiz._id,
        title: r.quiz.title,
        course: r.quiz.course,
      },
      score: r.score,
      totalQuestions: r.totalQuestions,
      answers: buildDetailedAnswers(r.quiz, r.answers),
      createdAt: r.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: detailedResults.length,
      data: detailedResults,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};