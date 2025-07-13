// server/routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken'); // For creating/signing JWTs
const User = require('../models/User'); // Import the User model
const asyncHandler = require('../middleware/asyncHandler'); // Our asyncHandler middleware

const router = express.Router();

// Helper function to generate a JWT token
const generateToken = (id, roles) => {
  return jwt.sign({ id, roles }, process.env.JWT_SECRET, {
    expiresIn: '1h', // Token expires in 1 hour
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ message: 'User with that email already exists' });
  }

  user = await User.findOne({ username });
  if (user) {
    return res.status(400).json({ message: 'User with that username already exists' });
  }

  // Create new user (password hashing is done in the User model's pre-save hook)
  user = new User({
    username,
    email,
    password, // The pre-save hook will hash this
    roles: ['viewer'] // Assign default 'user' role
  });

  await user.save();

  // Generate token immediately for the newly registered user
  const token = generateToken(user._id, user.roles);

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    },
  });
}));

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  // Find user by email (select password explicitly as it's set to select: false)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials (email not found)' });
  }

  // Compare provided password with stored hashed password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials (password incorrect)' });
  }

  // If credentials match, generate token
  const token = generateToken(user._id, user.roles);

  res.status(200).json({
    message: 'Logged in successfully',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    },
  });
}));

module.exports = router;