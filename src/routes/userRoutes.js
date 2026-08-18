const express = require('express');
const router = express.Router();
const { getUserById, updateUser } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { updateUserValidation, handleValidationErrors } = require('../middlewares/validators');

router.route('/:id')
    .get(protect, getUserById)
    .put(protect, updateUserValidation, handleValidationErrors, updateUser);

module.exports = router;