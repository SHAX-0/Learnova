const jwt = require('jsonwebtoken');
const User = require('../models/Users');

exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user no longer exists' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role '${req.user.role}' is not allowed to perform this action`
            });
        }
        next();
    };
};