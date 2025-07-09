// server/controllers/configurationController.js

const Configuration = require('../models/Configuration');
const Device = require('../models/Device'); // Need to interact with Device model

// @desc    Get all configurations for a specific device
// @route   GET /api/devices/:deviceId/configurations
// @access  Public
const getConfigurationsForDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    // Check if device exists
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // Find all configurations for the device, sorted by version descending
    const configurations = await Configuration.find({ deviceId })
      .sort({ version: -1 }); // Get latest versions first

    res.status(200).json(configurations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new configuration for a device
// @route   POST /api/devices/:deviceId/configurations
// @access  Public
const createConfiguration = async (req, res) => {
  const { deviceId } = req.params;
  const { content, pushedBy } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Configuration content is required' });
  }

  try {
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // Determine the next version number for this device
    const latestConfig = await Configuration.findOne({ deviceId })
      .sort({ version: -1 })
      .limit(1);

    const nextVersion = latestConfig ? latestConfig.version + 1 : 1;

    // Create the new configuration
    const newConfiguration = new Configuration({
      deviceId,
      content,
      version: nextVersion,
      pushedBy: pushedBy || 'System',
      isCurrent: true, // This new config will be the current one
    });

    const savedConfiguration = await newConfiguration.save();

    // Update the previous current configuration for this device to isCurrent: false
    if (latestConfig && latestConfig._id.toString() !== savedConfiguration._id.toString()) {
        await Configuration.findByIdAndUpdate(latestConfig._id, { isCurrent: false });
    }


    // Update the device's currentConfiguration field to reference the new config
    device.currentConfiguration = savedConfiguration._id;
    await device.save();

    res.status(201).json(savedConfiguration);

  } catch (error) {
    console.error("Error creating configuration:", error);
    // Handle unique index error if a version conflict occurs (unlikely with this logic, but good for robustness)
    if (error.code === 11000) {
        return res.status(409).json({ message: 'A configuration with this version already exists for this device. Please try again.' });
    }
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get a specific configuration by its ID (useful for deep linking or specific history view)
// @route   GET /api/configurations/:id
// @access  Public
const getConfigurationById = async (req, res) => {
  try {
    const config = await Configuration.findById(req.params.id);
    if (config) {
      res.status(200).json(config);
    } else {
      res.status(404).json({ message: 'Configuration not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set a historical configuration as the current configuration for a device
// @route   PUT /api/devices/:deviceId/configurations/:configId/set-current
// @access  Public
const setCurrentConfiguration = async (req, res) => {
    const { deviceId, configId } = req.params;

    try {
        const device = await Device.findById(deviceId);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        const newCurrentConfig = await Configuration.findById(configId);
        if (!newCurrentConfig || newCurrentConfig.deviceId.toString() !== deviceId) {
            return res.status(404).json({ message: 'Configuration not found for this device' });
        }

        // Find the *currently* active configuration for this device and set its isCurrent to false
        const oldCurrentConfig = await Configuration.findOneAndUpdate(
            { deviceId: deviceId, isCurrent: true },
            { $set: { isCurrent: false } },
            { new: true } // Return the updated document
        );

        // Set the selected configuration as the new current one
        newCurrentConfig.isCurrent = true;
        await newCurrentConfig.save();

        // Update the device's currentConfiguration reference
        device.currentConfiguration = newCurrentConfig._id;
        await device.save();

        res.status(200).json({
            message: `Configuration version ${newCurrentConfig.version} set as current for device ${device.name}`,
            newCurrentConfig: newCurrentConfig,
            oldCurrentConfig: oldCurrentConfig
        });

    } catch (error) {
        console.error("Error setting current configuration:", error);
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
  getConfigurationsForDevice,
  createConfiguration,
  getConfigurationById,
  setCurrentConfiguration,
};