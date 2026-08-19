const Course = require('../models/courseModel');

exports.createCourse = async (req, res, next) => {
    try {
        req.body.instructor = req.user._id;

        const course = await Course.create(req.body);

        res.status(201).json({
            success: true,
            data: course
        });
    } catch (error) {
        next(error);
    }
};

exports.getCourses = async (req, res, next) => {
    try {
        const { search, category, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        if (category) {
            query.category = category;
        }

        const skip = (page - 1) * limit;

        const courses = await Course.find(query)
            .populate('category', 'name')
            .populate('instructor', 'name')
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Course.countDocuments(query);

        res.status(200).json({
            success: true,
            count: courses.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: courses
        });
    } catch (error) {
        next(error);
    }
};

exports.getCourseById = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('category', 'name')
            .populate('instructor', 'name');

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        res.status(200).json({ success: true, data: course });
    } catch (error) {
        next(error);
    }
};

exports.updateCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Ownership check: Admin can edit any course, Instructor only their own
        if (req.user.role !== 'Admin' && course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not allowed to update a course that is not yours'
            });
        }

        // Prevent changing the instructor field through this endpoint
        delete req.body.instructor;

        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: updatedCourse });
    } catch (error) {
        next(error);
    }
};

exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Ownership check: Admin can delete any course, Instructor only their own
        if (req.user.role !== 'Admin' && course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not allowed to delete a course that is not yours'
            });
        }

        await course.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};