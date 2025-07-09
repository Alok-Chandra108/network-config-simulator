const mongoose = require('mongoose');

const ConfigurationSchema = mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Configuration must belong to a device'],
      ref: 'Device', // Refers to the Device model
    },
    content: {
      type: String,
      required: [true, 'Configuration content cannot be empty'],
    },
    version: {
      type: Number,
      required: true,
      min: 1, // Version numbers start from 1
    },
    pushedBy: {
      type: String,
      default: 'System', // Could be 'Admin', 'User', etc.
    },
    isCurrent: { // Flag to indicate if this is the active configuration for its device
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields (pushedAt will be createdAt)
  }
);

// Add a unique compound index for deviceId and version
// This ensures that each device has unique version numbers for its configurations
ConfigurationSchema.index({ deviceId: 1, version: 1 }, { unique: true });


const Configuration = mongoose.model('Configuration', ConfigurationSchema);

module.exports = Configuration;