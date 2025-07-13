// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    trim: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address'] // Email format validation
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false // Do not return password by default in queries
  },
  roles: {
    type: [String], // Array of strings, e.g., ['user', 'admin']
    default: ['viewer'], // Default role for new users
    enum: ['user', 'admin', 'viewer'] // Restrict possible roles
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

// Mongoose middleware to hash the password before saving a new user or updating password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) { // Only hash if password field is modified
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password in DB
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);