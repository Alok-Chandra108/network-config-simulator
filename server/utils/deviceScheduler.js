// server/utils/deviceScheduler.js
const cron = require('node-cron');
const Device = require('../models/Device');
const { pingHost } = require('../utils/ping');

let io; // Declare io in a scope accessible by checkAllDeviceStatuses

// Define the maximum number of concurrent pings
const CONCURRENCY_LIMIT = 10;

async function checkAllDeviceStatuses() {
  try {
    const devices = await Device.find({});
    const devicesToPing = devices.filter(device => device.ipAddress);
    const devicesWithoutIp = devices.filter(device => !device.ipAddress);

    // Process devices without an IP address immediately
    for (const device of devicesWithoutIp) {
      const originalIsOnline = device.isOnline; // Store original status for comparison
      // Only update if the status actually changes to avoid unnecessary writes
      if (device.isOnline || device.lastPingLatency !== null) {
        device.isOnline = false;
        device.lastPingTime = new Date();
        device.lastPingLatency = null;
        await device.save();
        // Emit update if status changed
        if (io && originalIsOnline !== device.isOnline) {
          io.emit('deviceStatusUpdate', {
            _id: device._id,
            isOnline: device.isOnline,
            lastPingTime: device.lastPingTime,
            lastPingLatency: device.lastPingLatency
          });
        }
      }
    }

    const pingPromises = [];
    const updatePromises = [];
    let activePings = 0;
    let deviceIndex = 0;

    const processNextDevice = async () => {
      if (deviceIndex >= devicesToPing.length) {
        return;
      }

      const device = devicesToPing[deviceIndex++];
      const originalIsOnline = device.isOnline; // Store original status for comparison
      activePings++;

      const pingPromise = (async () => {
        const { isOnline, latency } = await pingHost(device.ipAddress);

        const updatePromise = (async () => {
          device.isOnline = isOnline;
          device.lastPingTime = new Date();
          device.lastPingLatency = latency;
          await device.save();

          // Emit a Socket.IO event if the status has changed
          if (io && originalIsOnline !== device.isOnline) {
            io.emit('deviceStatusUpdate', {
              _id: device._id,
              isOnline: device.isOnline,
              lastPingTime: device.lastPingTime,
              lastPingLatency: device.lastPingLatency
            });
          }
        })();

        updatePromises.push(updatePromise);
        activePings--;
        processNextDevice();
      })();

      pingPromises.push(pingPromise);
    };

    for (let i = 0; i < CONCURRENCY_LIMIT && i < devicesToPing.length; i++) {
      processNextDevice();
    }

    await Promise.allSettled(pingPromises);
    await Promise.allSettled(updatePromises);

  } catch (error) {
    console.error('Error during automated device status check:', error);
  }
}

// Accepts the io (Socket.IO) instance
function startDeviceStatusScheduler(socketioInstance) {
  io = socketioInstance; // Assign the global io variable
  cron.schedule('*/5 * * * *', () => {
    checkAllDeviceStatuses();
  });

  // Run once immediately when the server starts
  checkAllDeviceStatuses();
}

module.exports = {
  startDeviceStatusScheduler,
  checkAllDeviceStatuses
};