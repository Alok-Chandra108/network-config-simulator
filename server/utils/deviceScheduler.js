// server/utils/deviceScheduler.js
const cron = require('node-cron');
const Device = require('../models/Device');
const { pingHost } = require('../utils/ping');

// We'll pass the io instance when starting the scheduler
let io; // Declare io in a scope accessible by checkAllDeviceStatuses

// Define the maximum number of concurrent pings
const CONCURRENCY_LIMIT = 10;

async function checkAllDeviceStatuses() {
    console.log('--- Starting automated device status check with concurrency limit ---');
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
                console.log(`  -> ${device.name} (no IP) marked Offline`);
                // Emit update if status changed
                if (io && originalIsOnline !== device.isOnline) {
                    io.emit('deviceStatusUpdate', {
                        _id: device._id,
                        isOnline: device.isOnline,
                        lastPingTime: device.lastPingTime,
                        lastPingLatency: device.lastPingLatency
                    });
                    console.log(`  -> Emitted status update for ${device.name} (no IP)`);
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
                console.log(`Checking status for device: ${device.name} (${device.ipAddress})`);
                const { isOnline, latency } = await pingHost(device.ipAddress);

                const updatePromise = (async () => {
                    device.isOnline = isOnline;
                    device.lastPingTime = new Date();
                    device.lastPingLatency = latency;
                    await device.save();
                    console.log(`  -> ${device.name} is ${isOnline ? 'Online' : 'Offline'}`);

                    // Emit a Socket.IO event if the status has changed
                    if (io && originalIsOnline !== device.isOnline) {
                        io.emit('deviceStatusUpdate', {
                            _id: device._id,
                            isOnline: device.isOnline,
                            lastPingTime: device.lastPingTime,
                            lastPingLatency: device.lastPingLatency
                        });
                        console.log(`  -> Emitted status update for ${device.name}`);
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

        console.log('--- Automated device status check finished ---');
    } catch (error) {
        console.error('Error during automated device status check:', error);
    }
}

// Modify startDeviceStatusScheduler to accept the io instance
function startDeviceStatusScheduler(socketioInstance) {
    io = socketioInstance; // Assign the global io variable
    cron.schedule('*/5 * * * *', () => {
        checkAllDeviceStatuses();
    });

    console.log('Device status scheduler started (runs every 5 minutes).');

    // Run once immediately when the server starts
    checkAllDeviceStatuses();
}

module.exports = {
    startDeviceStatusScheduler,
    checkAllDeviceStatuses
};