// server/controllers/deviceController.js

const asyncHandler = require('express-async-handler');
const Device = require('../models/Device');
const Configuration = require('../models/Configuration');
const User = require('../models/User');
const { exec } = require('child_process');

// Helper function to promisify exec and handle ping output
const pingHost = (ipAddress) => {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    const pingCommand = isWindows
      ? `ping -n 4 -w 1000 ${ipAddress}`
      : `ping -c 4 -W 1 ${ipAddress}`;

    exec(pingCommand, (error, stdout, stderr) => {
      let isOnline = false;
      let latency = null;

      if (stdout) {
        if (stdout.includes('bytes from') || stdout.includes('TTL=')) {
          isOnline = true;
          const match = stdout.match(/time=(\d+(\.\d+)?) ?ms/);
          if (match) {
            latency = parseFloat(match[1]);
          } else {
            const summaryMatch = stdout.match(/min\/avg\/max\/mdev = (\d+\.?\d*)\/(\d+\.?\d*)\/(\d+\.?\d*)/);
            if (summaryMatch) {
              latency = parseFloat(summaryMatch[2]);
            }
          }
        }
      }
      if (error || stderr) {
        console.error(`Ping error for ${ipAddress}:`, error || stderr);
        isOnline = false;
      }
      resolve({ isOnline, latency });
    });
  });
};


// @desc    Get devices
// @route   GET /api/devices
// @access  Private (All authenticated users get all devices)
const getDevices = asyncHandler(async (req, res) => {
  try {
    // All authenticated users can now see all devices
    const devices = await Device.find({})
      .populate('owner', 'username email') // Populate owner for display
      .populate('currentConfiguration', 'version createdAt content'); // Populate current configuration for display
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single device by ID
// @route   GET /api/devices/:id
// @access  Private (All authenticated users can get any device by ID)
const getDeviceById = asyncHandler(async (req, res) => {
  try {
    const device = await Device.findById(req.params.id)
      .populate('owner', 'username email') // Populate owner for display
      .populate('currentConfiguration', 'version createdAt content'); // Populate current configuration for display

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // All authenticated users can now view any device details

    res.status(200).json(device);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid device ID format.' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new device
// @route   POST /api/devices
// @access  Private (Admin can assign owner, User defaults to self)
const createDevice = asyncHandler(async (req, res) => {
  const { name, type, ipAddress, location, description, owner } = req.body;

  // Basic validation
  if (!name || !type) {
    return res.status(400).json({ message: 'Device name and type are required' });
  }

  // Determine device owner
  let deviceOwnerId;
  if (req.user.roles.includes('admin') && owner) {
    const targetUser = await User.findById(owner);
    if (!targetUser) {
      return res.status(400).json({ message: 'Provided owner ID does not exist.' });
    }
    deviceOwnerId = owner;
  } else {
    // Default owner to the logged-in user if not admin or owner not provided
    deviceOwnerId = req.user.id;
  }

  try {
    const existingDeviceByName = await Device.findOne({ name });
    if (existingDeviceByName) {
      return res.status(400).json({ message: 'A device with this name already exists.' });
    }

    if (ipAddress) {
      const existingDeviceByIp = await Device.findOne({ ipAddress });
      if (existingDeviceByIp) {
        return res.status(400).json({ message: 'A device with this IP address already exists.' });
      }
    }

    const device = new Device({
      name,
      type,
      ipAddress,
      location,
      description,
      owner: deviceOwnerId,
    });

    const createdDevice = await device.save();
    // Populate owner and current configuration for the response
    await createdDevice.populate('owner', 'username email');
    await createdDevice.populate('currentConfiguration', 'version createdAt content');

    res.status(201).json(createdDevice);
  } catch (error) {
    console.error('Error in createDevice:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a device
// @route   PUT /api/devices/:id
// @access  Private (Admin can update any, User can update own)
const updateDevice = asyncHandler(async (req, res) => {
  const { name, type, ipAddress, location, description, owner } = req.body;

  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // Retained authorization: Only admin or owner can update device details
    if (!req.user.roles.includes('admin') && device.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this device.' });
    }

    if (name && name !== device.name) {
      const existingDeviceWithName = await Device.findOne({ name });
      if (existingDeviceWithName && existingDeviceWithName._id.toString() !== device._id.toString()) {
        return res.status(400).json({ message: 'Another device with this name already exists.' });
      }
    }

    if (ipAddress && ipAddress !== device.ipAddress) {
      const existingDeviceWithIp = await Device.findOne({ ipAddress });
      if (existingDeviceWithIp && existingDeviceWithIp._id.toString() !== device._id.toString()) {
        return res.status(400).json({ message: 'Another device with this IP address already exists.' });
      }
    }

    // Handle ipAddress being explicitly cleared
    if (ipAddress === null || ipAddress === '') {
      device.ipAddress = null;
    } else {
      device.ipAddress = ipAddress !== undefined ? ipAddress : device.ipAddress;
    }

    device.name = name || device.name;
    device.type = type || device.type;
    device.location = location !== undefined ? location : device.location;
    device.description = description !== undefined ? description : device.description;

    // Admin can change owner, other roles cannot
    if (req.user.roles.includes('admin') && owner !== undefined) {
      if (owner !== null && owner !== '') {
        const targetUser = await User.findById(owner);
        if (!targetUser) {
          return res.status(400).json({ message: 'Provided owner ID does not exist.' });
        }
        device.owner = owner;
      } else {
        // If admin tries to set owner to null/empty, enforce valid owner
        return res.status(400).json({ message: 'Device owner cannot be empty or null.' });
      }
    } else if (!req.user.roles.includes('admin') && owner !== undefined) {
      // Non-admin trying to change owner
      return res.status(403).json({ message: 'You are not authorized to change the device owner.' });
    }

    const updatedDevice = await device.save();
    // Populate owner and current configuration for the response
    await updatedDevice.populate('owner', 'username email');
    await updatedDevice.populate('currentConfiguration', 'version createdAt content');

    res.status(200).json(updatedDevice);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid device ID format.' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a device
// @route   DELETE /api/devices/:id
// @access  Private (Admin only - handled by route middleware)
const deleteDevice = asyncHandler(async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);

    if (device) {
      // Delete associated configurations before deleting the device
      await Configuration.deleteMany({ device: device._id });
      await device.deleteOne();

      res.status(200).json({ message: 'Device removed and associated configurations deleted' });
    } else {
      res.status(404).json({ message: 'Device not found' });
    }
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid device ID format.' });
    }
    res.status(500).json({ message: error.message });
  }
});


// @desc    Check device connectivity status
// @route   GET /api/devices/:id/status
// @access  Private (All authenticated users can check status of any device)
const checkDeviceStatus = asyncHandler(async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // All authenticated users can now check status of any device

    if (!device.ipAddress) {
      return res.status(400).json({ message: 'Device does not have an IP address configured for status check.' });
    }

    const { isOnline, latency } = await pingHost(device.ipAddress);

    device.isOnline = isOnline;
    device.lastPingTime = new Date();
    device.lastPingLatency = latency;

    await device.save();

    res.status(200).json({
      _id: device._id,
      name: device.name,
      ipAddress: device.ipAddress,
      isOnline: device.isOnline,
      lastPingTime: device.lastPingTime,
      lastPingLatency: device.lastPingLatency,
      message: isOnline ? 'Device is online.' : 'Device is offline or unreachable.',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid device ID format.' });
    }
    res.status(500).json({ message: error.message });
  }
});


module.exports = {
  getDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  checkDeviceStatus,
};