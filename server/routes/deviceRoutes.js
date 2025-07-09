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

const {
  getConfigurationsForDevice,
  createConfiguration,
  setCurrentConfiguration,
} = require('../controllers/configurationController'); 


// Combine routes that share the same path
router.route('/').get(getDevices).post(createDevice);
router.route('/:id').get(getDeviceById).put(updateDevice).delete(deleteDevice);
router.get('/:id/status', checkDeviceStatus);

router.route('/:deviceId/configurations')
  .get(getConfigurationsForDevice)
  .post(createConfiguration);

router.put('/:deviceId/configurations/:configId/set-current', setCurrentConfiguration);

module.exports = router;