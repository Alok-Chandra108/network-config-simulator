// server/routes/configurationRoutes.js

const express = require('express');
const router = express.Router();
const {
  // Only include functions that operate on configurations standalone
  getConfigurationById,
} = require('../controllers/configurationController');
const { protect } = require('../middleware/authMiddleware'); 
const { authorizeRoles } = require('../middleware/roleMiddleware');
const asyncHandler = require('../middleware/asyncHandler');


// Route for getting a single configuration by its own ID (standalone)
// Accessible by admin, user, and viewer roles
router.get('/:id', protect, authorizeRoles(['admin', 'user', 'viewer']), asyncHandler(getConfigurationById));

module.exports = router;