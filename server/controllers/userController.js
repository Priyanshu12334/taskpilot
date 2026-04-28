const userService = require('../services/userService');


// @desc    Update User Name and Email
// @route   PUT /api/user/update
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await userService.findUserById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email } = req.body;

    const updatedUser = await userService.updateUserProfile(user, name, email);

    // Provide back updated data (hiding password)
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      canAccessChat: updatedUser.canAccessChat
    });

  } catch (error) {
    if (error.code === 11000) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update User Password
// @route   PUT /api/user/password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const user = await userService.findUserById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { oldPassword, newPassword } = req.body;

    // Verify existing password
    if (!(await user.matchPassword(oldPassword))) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    // Force constraints if any (e.g., min length)
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    await userService.updateUserPassword(user, newPassword);

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users for dropdown
// @route   GET /api/user/all
// @access  Private
const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role (admin only)
// @route   PATCH /api/user/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['Admin', 'Member', 'Pending'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "Admin", "Member" or "Pending".' });
    }

    // Prevent admin from demoting themselves
    if (req.params.id === req.user._id.toString() && role === 'Member') {
      return res.status(400).json({ message: 'You cannot remove your own admin role.' });
    }

    const updated = await userService.updateUserRole(req.params.id, role);

    if (!updated) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ 
      _id: updated._id, 
      name: updated.name, 
      email: updated.email, 
      role: updated.role, 
      canAccessChat: updated.canAccessChat,
      purpose: updated.purpose
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user chat access (admin only)
// @route   PATCH /api/user/:id/chat-access
// @access  Private/Admin
const updateUserChatAccess = async (req, res) => {
  try {
    const { canAccessChat } = req.body;

    const updated = await userService.updateUserChatAccess(req.params.id, canAccessChat);

    if (!updated) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role, canAccessChat: updated.canAccessChat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateProfile, updatePassword, getAllUsers, updateUserRole, updateUserChatAccess };
