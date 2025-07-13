// server/routes/deviceRoutes.js

const express = require('express');
const router = express.Router();
const {
  getDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  checkDeviceStatus
} = require('../controllers/deviceController');
const { protect } = require('../middleware/authMiddleware'); // Authentication middleware
const { authorizeRoles } = require('../middleware/roleMiddleware'); // Authorization middleware
const asyncHandler = require('../middleware/asyncHandler'); // Async handler for error handling

const {
  getConfigurationsForDevice,
  createConfiguration,
  setCurrentConfiguration,
} = require('../controllers/configurationController');


// Protect and authorize device-related routes
router.route('/')
  .get(protect, authorizeRoles(['admin', 'user', 'viewer']), asyncHandler(getDevices)) // Accessible by admin, user, viewer
  .post(protect, authorizeRoles(['admin', 'user']), asyncHandler(createDevice)); // Accessible by admin, user

router.route('/:id')
  .get(protect, authorizeRoles(['admin', 'user', 'viewer']), asyncHandler(getDeviceById)) // Accessible by admin, user, viewer
  .put(protect, authorizeRoles(['admin', 'user']), asyncHandler(updateDevice)) // Accessible by admin, user
  .delete(protect, authorizeRoles(['admin']), asyncHandler(deleteDevice)); // Accessible only by admin

router.get('/:id/status', protect, authorizeRoles(['admin', 'user', 'viewer']), asyncHandler(checkDeviceStatus));// Accessible by admin, user, viewer

// Protect and authorize configuration-related routes (currently handled in this file)
router.route('/:deviceId/configurations')
  .get(protect, authorizeRoles(['admin', 'user', 'viewer']), asyncHandler(getConfigurationsForDevice)) // Accessible by admin, user, viewer
  .post(protect, authorizeRoles(['admin', 'user']), asyncHandler(createConfiguration)); // Accessible by admin, user

router.put('/:deviceId/configurations/:configId/set-current', protect, authorizeRoles(['admin', 'user']), asyncHandler(setCurrentConfiguration)); // Accessible by admin, user

module.exports = router;