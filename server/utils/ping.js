// server/utils/ping.js
const ping = require('ping');

// Function to ping a host
async function pingHost(host) {
    try {
        const res = await ping.promise.probe(host);
        let latencyValue = null;

        // Only set latency if the device is alive AND res.time is a valid number.
        // The 'ping' library can return 'unknown' as a string for res.time
        // even if res.alive is false or sometimes true in odd cases.
        if (res.alive && typeof res.time === 'number') {
            latencyValue = res.time;
        } else if (res.alive && res.time === 'unknown') {
            // If device is alive but latency is 'unknown', we treat latency as null.
            // This ensures we don't try to save a string to a Number field.
            latencyValue = null;
        }
        // If res.alive is false, latencyValue will correctly remain null.

        return {
            isOnline: res.alive,
            latency: latencyValue // This will now always be a number or null
        };
    } catch (error) {
        // This catch block handles network errors or unresolvable hosts
        console.error(`Error pinging ${host}:`, error.message);
        return {
            isOnline: false,
            latency: null // Explicitly null on any ping error
        };
    }
}

module.exports = {
    pingHost
};