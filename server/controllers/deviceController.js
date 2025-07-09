// server/controllers/deviceController.js

const asyncHandler = require('express-async-handler'); // Keep this, though we'll use try/catch directly for consistency
const Device = require('../models/Device');
const Configuration = require('../models/Configuration');
const { exec } = require('child_process'); // This is needed for the ping functionality

// Helper function to promisify exec and handle ping output
const pingHost = (ipAddress) => {
  return new Promise((resolve) => {
    // -c 4: send 4 packets (Linux/macOS)
    // -W 1: wait 1 second for reply (Linux/macOS)
    // For Windows: -n 4 -w 1000 (send 4 packets, wait 1000ms per reply)
    const isWindows = process.platform === 'win32';
    const pingCommand = isWindows
      ? `ping -n 4 -w 1000 ${ipAddress}`
      : `ping -c 4 -W 1 ${ipAddress}`; // For Linux/macOS

    exec(pingCommand, (error, stdout, stderr) => {
      let isOnline = false;
      let latency = null; // in ms

      if (stdout) {
        console.log(`Ping stdout for ${ipAddress}:\n${stdout}`);
        // Check for success indicators
        if (stdout.includes('bytes from') || stdout.includes('TTL=')) {
          isOnline = true;
          // Attempt to parse latency (example for Linux/macOS 'avg/min/max/mdev')
          // Windows output is different, might need a more robust regex for it.
          const match = stdout.match(/time=(\d+(\.\d+)?) ?ms/); // Tries to find 'time=XX.YY ms'
          if (match) {
            latency = parseFloat(match[1]);
          } else {
             // Fallback for summary line if individual times aren't parsed
             const summaryMatch = stdout.match(/min\/avg\/max\/mdev = (\d+\.?\d*)\/(\d+\.?\d*)\/(\d+\.?\d*)/);
             if (summaryMatch) {
                 latency = parseFloat(summaryMatch[2]); // Average latency
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


// @desc    Get all devices
// @route   GET /api/devices
// @access  Public
const getDevices = async (req, res) => {
  try {
    const devices = await Device.find({});
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single device by ID
// @route   GET /api/devices/:id
// @access  Public
const getDeviceById = async (req, res) => {
  try {
    // Populate currentConfiguration is handled by the pre-hook in Device.js now,
    // so explicit .populate() here is optional but harmless if left.
    const device = await Device.findById(req.params.id);

    if (device) {
      res.status(200).json(device);
    } else {
      res.status(404).json({ message: 'Device not found' });
    }
  } catch (error) {
    // Handle CastError specifically if the ID format is invalid
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid device ID format.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new device
// @route   POST /api/devices
// @access  Public
const createDevice = async (req, res) => {
  const { name, type, ipAddress, location, description } = req.body;

  // Basic validation
  if (!name || !type) {
    return res.status(400).json({ message: 'Device name and type are required' });
  }

  try {
    // Check if a device with this name already exists
    const existingDeviceByName = await Device.findOne({ name });
    if (existingDeviceByName) {
      return res.status(400).json({ message: 'A device with this name already exists.' });
    }

    // Check if a device with this IP address already exists, only if ipAddress is provided
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
    });

    const createdDevice = await device.save();
    res.status(201).json(createdDevice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a device
// @route   PUT /api/devices/:id
// @access  Public
const updateDevice = async (req, res) => {
  const { name, type, ipAddress, location, description } = req.body;

  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // Check for duplicate name if name is being changed
    if (name && name !== device.name) {
      const existingDeviceWithName = await Device.findOne({ name });
      if (existingDeviceWithName) {
        return res.status(400).json({ message: 'Another device with this name already exists.' });
      }
    }

    // Check for duplicate IP if IP is being changed and is not null/empty
    if (ipAddress && ipAddress !== device.ipAddress) {
      const existingDeviceWithIp = await Device.findOne({ ipAddress });
      if (existingDeviceWithIp) {
        return res.status(400).json({ message: 'Another device with this IP address already exists.' });
      }
    }
    // If ipAddress is explicitly set to null/empty string, allow it
    if (ipAddress === null || ipAddress === '') {
        device.ipAddress = null; // Ensure it's stored as null if explicitly cleared
    } else {
        device.ipAddress = ipAddress !== undefined ? ipAddress : device.ipAddress;
    }


    device.name = name || device.name;
    device.type = type || device.type;
    device.location = location !== undefined ? location : device.location;
    device.description = description !== undefined ? description : device.description;

    const updatedDevice = await device.save();
    res.status(200).json(updatedDevice);
  } catch (error) {
    // Handle CastError specifically if the ID format is invalid
    if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid device ID format.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a device
// @route   DELETE /api/devices/:id
// @access  Public
const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);

    if (device) {
      // Optional: Clean up associated configurations (good practice for referential integrity)
      await Configuration.deleteMany({ device: device._id }); // Use 'device' as the field name in Configuration model

      await device.deleteOne(); // Use deleteOne() for Mongoose 6+

      res.status(200).json({ message: 'Device removed and associated configurations deleted' });
    } else {
      res.status(404).json({ message: 'Device not found' });
    }
  } catch (error) {
    // Handle CastError specifically if the ID format is invalid
    if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid device ID format.' });
    }
    res.status(500).json({ message: error.message });
  }
};


// @desc    Check device connectivity status
// @route   GET /api/devices/:id/status
// @access  Public
const checkDeviceStatus = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    if (!device.ipAddress) {
      return res.status(400).json({ message: 'Device does not have an IP address configured for status check.' });
    }

    const { isOnline, latency } = await pingHost(device.ipAddress);

    device.isOnline = isOnline;
    device.lastPingTime = new Date();
    device.lastPingLatency = latency;

    await device.save();

    res.status(200).json({
      _id: device._id, // Include _id for client-side updates if needed
      name: device.name,
      ipAddress: device.ipAddress,
      isOnline: device.isOnline,
      lastPingTime: device.lastPingTime,
      lastPingLatency: device.lastPingLatency,
      message: isOnline ? 'Device is online.' : 'Device is offline or unreachable.',
    });
  } catch (error) {
    // Handle CastError specifically if the ID format is invalid
    if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid device ID format.' });
    }
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  checkDeviceStatus, // <--- EXPORT THE NEW FUNCTION
};