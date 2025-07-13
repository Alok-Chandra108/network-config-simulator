// server/models/Device.js
const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a device name'],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify a device type'],
      enum: ['Router', 'Switch', 'Firewall', 'Load Balancer', 'Server', 'Other', 'Light', 'Sensor', 'Camera'],
    },
    ipAddress: {
      type: String,
      match: [
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        'Please enter a valid IP address',
      ],
      default: null,
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
      default: false,
    },
    lastPingTime: {
      type: Date,
      default: null,
    },
    lastPingLatency: {
      type: Number,
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    currentConfiguration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Configuration',
      default: null,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true, getters: true },
    toJSON: { virtuals: true, getters: true }
  }
);

deviceSchema.pre(/^find/, function(next) {
  this.populate('currentConfiguration');
  this.populate('owner', 'username email');
  next();
});

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;