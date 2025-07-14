// server/controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin (only administrators should access this)
exports.getAllUsers = asyncHandler(async (req, res) => {
    // Find all users and select all fields EXCEPT the password for security
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
});