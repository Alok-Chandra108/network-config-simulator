// server/models/Device.js
const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a device name'],
      unique: true, // Device names should be unique
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify a device type'],
      enum: ['Router', 'Switch', 'Firewall', 'Load Balancer', 'Server', 'Other'], // Enforce specific types
    },
    ipAddress: {
      type: String,
      match: [
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        'Please enter a valid IP address',
      ],
      default: null, // Allow null if not set, and not necessarily unique
    },
    location: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isOnline: {
      type: Boolean,
      default: false, // Assume offline until checked
    },
    lastPingTime: {
      type: Date,
      default: null, // When the last ping check was performed
    },
    lastPingLatency: {
      type: Number, // Latency in milliseconds
      default: null,
    },
    // Reference to the current configuration document
    currentConfiguration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Configuration', // Refers to the Configuration model
      default: null, // No current configuration initially
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
    toObject: { virtuals: true, getters: true }, // Ensure virtuals and getters are included when converting to object
    toJSON: { virtuals: true, getters: true }   // Ensure virtuals and getters are included when converting to JSON
  }
);

// This pre-hook ensures that 'currentConfiguration' is automatically populated
// whenever a find query (e.g., find, findOne, findById) is executed on Device model.
deviceSchema.pre(/^find/, function(next) {
  this.populate('currentConfiguration');
  next();
});

// Middleware to handle currentConfiguration when a device is deleted
// (Optional but good practice for cleanup - we can implement this later if needed)
// deviceSchema.pre('remove', async function(next) {
//   await this.model('Configuration').deleteMany({ deviceId: this._id });
//   next();
// });

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;