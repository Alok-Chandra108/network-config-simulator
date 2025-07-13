// server/routes/configurationRoutes.js

const express = require('express');
const router = express.Router();
const {
  // Only include functions that operate on configurations standalone
  getConfigurationById,
} = require('../controllers/configurationController');
const { protect } = require('../middleware/authMiddleware'); // Authentication middleware
const { authorizeRoles } = require('../middleware/roleMiddleware'); // Authorization middleware
const asyncHandler = require('../middleware/asyncHandler'); // Async handler for error handling


// Route for getting a single configuration by its own ID (standalone)
// Accessible by admin, user, and viewer roles
router.get('/:id', protect, authorizeRoles(['admin', 'user', 'viewer']), asyncHandler(getConfigurationById));

module.exports = router;