// server/routes/configurationRoutes.js

const express = require('express');
const router = express.Router();
const {
  // Only include functions that operate on configurations standalone
  getConfigurationById,
} = require('../controllers/configurationController');

// Route for getting a single configuration by its own ID (standalone)
router.get('/:id', getConfigurationById);

module.exports = router;