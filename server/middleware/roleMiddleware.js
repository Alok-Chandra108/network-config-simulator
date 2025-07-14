// server/middleware/roleMiddleware.js
const asyncHandler = require('./asyncHandler'); 

// Middleware to restrict access based on roles
const authorizeRoles = (roles) => {
  return asyncHandler(async (req, res, next) => {
    // req.user is populated by the protect middleware (authMiddleware)
    if (!req.user || !req.user.roles) {
      res.status(401); // Unauthorized if user or roles are missing (should ideally be caught by 'protect' first)
      throw new Error('Not authorized, no user roles found.');
    }

    // Check if the user's roles include any of the allowed roles
    const hasPermission = roles.some(role => req.user.roles.includes(role));

    if (hasPermission) {
      next(); // User has permission, proceed
    } else {
      res.status(403); // Forbidden
      throw new Error(`Not authorized to access this route. Required roles: ${roles.join(', ')}.`);
    }
  });
};

module.exports = { authorizeRoles };