const User = require('../models/User');

// @desc    Promote a user to member (Full Access)
// @route   PUT /api/admin/promote-user/:id
// @access  Private/Admin
const promoteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Allow promotion from simpleUser, Pending, or Rejected
    const currentRole = user.role?.toLowerCase();
    if (!['simpleuser', 'pending', 'rejected'].includes(currentRole)) {
      return res.status(400).json({ message: 'User is already a member or admin.' });
    }

    user.role = 'member';
    user.status = 'active'; // Ensure they are active if they were rejected/blocked
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      purpose: user.purpose
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Block a user (Revoke Access)
// @route   PUT /api/admin/block-user/:id
// @access  Private/Admin
const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role?.toLowerCase() === 'admin') {
      return res.status(400).json({ message: 'Cannot block an administrator.' });
    }

    user.status = 'blocked';
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      message: 'User has been blocked successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unblock a user (Restore Access)
// @route   PUT /api/admin/unblock-user/:id
// @access  Private/Admin
const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'active';
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      message: 'User has been unblocked successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get system stats for Admin Dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalUsers   = await User.countDocuments({});
    const blockedUsers = await User.countDocuments({ status: 'blocked' });
    const simpleUsers  = await User.countDocuments({ 
      role: { $in: ['simpleUser', 'Pending'] }
    });
    const members      = await User.countDocuments({ 
      role: { $in: ['member', 'Member'] }
    });
    const admins       = await User.countDocuments({ 
      role: { $in: ['admin', 'Admin'] }
    });

    res.json({
      totalUsers,
      blockedUsers,
      simpleUsers,
      members,
      admins
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  promoteUser,
  blockUser,
  unblockUser,
  getAdminStats,
};
