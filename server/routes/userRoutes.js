// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');


router.get('/', protect, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/:id', protect, authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await user.deleteOne();
    res.json({ message: 'User removed' });

  } catch (error) {
    console.error(`Error deleting user ${req.params.id}:`, error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/:id', protect, authorize(['admin']), async (req, res) => {
  const { username, email, roles } = req.body; 

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // IMPORTANT: Prevent admin from completely removing their own admin role
    if (user._id.toString() === req.user.id.toString()) {
      // If the admin tries to remove 'admin' role from themselves
      if (roles && !roles.includes('admin') && user.roles.includes('admin')) {
        return res.status(403).json({ message: 'You cannot remove your own admin role.' });
      }
      // If the admin tries to remove all roles from themselves
      if (roles && roles.length === 0) {
        return res.status(403).json({ message: 'You cannot remove all roles from your own account.' });
      }
    }


    if (username) user.username = username;
    if (email) user.email = email;
    if (roles) {
      const validRoles = ['admin', 'user', 'viewer']; 
      const hasInvalidRoles = roles.some(role => !validRoles.includes(role));
      if (hasInvalidRoles) {
        return res.status(400).json({ message: 'One or more provided roles are invalid.' });
      }
      user.roles = roles;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      roles: updatedUser.roles,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });

  } catch (error) {
    console.error(`Error updating user ${req.params.id}:`, error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;