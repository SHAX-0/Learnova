const User = require('../models/Users');

exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Only the user themselves or an Admin can view this profile
        if (req.user.role !== 'Admin' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not allowed to view this profile'
            });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Only the user themselves or an Admin can update this profile
        if (req.user.role !== 'Admin' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not allowed to update this profile'
            });
        }

        const { name, email, role } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;

        // Only an Admin is allowed to change roles (prevents privilege escalation)
        if (role) {
            if (req.user.role !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Only an Admin can change a user role'
                });
            }
            updateData.role = role;
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        }).select('-password');

        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        next(error);
    }
};