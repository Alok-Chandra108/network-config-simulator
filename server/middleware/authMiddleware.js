// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model
const asyncHandler = require('./asyncHandler'); // Our asyncHandler middleware

// Middleware to protect routes (ensure user is logged in)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in the 'Authorization' header (Bearer Token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]; // Format: "Bearer TOKEN"

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decodes the payload

      // Find user by ID and attach to request object
      // We exclude the password from the fetched user object for security
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401); // Unauthorized
        throw new Error('Not authorized, user not found');
      }

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401); // Unauthorized
      // Provide a more specific message for common token errors
      if (error.name === 'TokenExpiredError') {
        throw new Error('Not authorized, token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Not authorized, invalid token');
      } else {
        throw new Error('Not authorized, token failed');
      }
    }
  }

  if (!token) {
    res.status(401); // Unauthorized
    throw new Error('Not authorized, no token provided');
  }
});

// Middleware to authorize user roles
const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user || (roles.length > 0 && !roles.some(role => req.user.roles.includes(role)))) {
            res.status(403);
            throw new Error('Forbidden: You do not have access to this route');
        }
        next();
    };
};

module.exports = { protect, authorize };