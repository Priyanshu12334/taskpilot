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
    if (req.query.assignable === 'true' || req.query.role === 'member') {
      const users = await userService.getAssignableUsers();
      return res.json(users);
    }
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get assignable members for task assignment dropdown
// @route   GET /api/user/assignable
// @access  Private
const getAssignableUsers = async (req, res) => {
  try {
    const users = await userService.getAssignableUsers();
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

// @desc    Submit a support / contact message
// @route   POST /api/user/contact
// @access  Private
const submitContactMessage = async (req, res) => {
  try {
    const { name, email, queryType, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill in all required fields' 
      });
    }

    const contactMsg = await userService.createContactMessage(
      req.user._id,
      name,
      email,
      req.user.role || 'simpleUser',
      queryType || 'General Query',
      subject,
      message
    );

    // Create notifications for Admins (excluding the sender if they are an admin)
    const User = require('../models/User');
    const Notification = require('../models/Notification');
    const admins = await User.find({ role: { $in: ['admin', 'Admin'] } });
    const io = req.app.get('io');

    let actionText = 'support message';
    if (queryType === 'Technical Issue') {
      actionText = 'technical issue';
    } else if (queryType === 'Account / Access') {
      actionText = 'account query';
    } else if (queryType === 'Feedback') {
      actionText = 'feedback';
    }
    const notifMessage = `New ${actionText} from ${name}`;

    for (const adminUser of admins) {
      // Do NOT create self-notification if admin is sending the message
      if (adminUser._id.toString() === req.user._id.toString()) {
        continue;
      }

      const notif = await Notification.create({
        user: adminUser._id,
        message: notifMessage,
        type: 'contact',
        isRead: false,
        contactMessageId: contactMsg._id
      });

      if (io) {
        io.emit(`notification_${adminUser._id}`, notif);
      }
    }

    if (io) {
      io.emit('newContactMessage', contactMsg);
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been submitted successfully.',
      data: contactMsg
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Unable to submit your message.' 
    });
  }
};

// @desc    Get all support / contact messages (Admin only)
// @route   GET /api/user/contact
// @access  Private/Admin
const getContactMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const search = req.query.search || '';
    const queryType = req.query.queryType;
    const statusFilter = req.query.status;

    let filter = {};
    if (queryType && queryType !== 'All') {
      filter.queryType = queryType;
    }
    if (statusFilter && statusFilter !== 'All') {
      if (statusFilter === 'Unread') filter.isRead = false;
      else if (statusFilter === 'Read') filter.isRead = true;
      else if (statusFilter === 'Resolved') filter.status = 'resolved';
      else if (statusFilter === 'Pending') filter.status = 'pending';
    }

    const data = await userService.getContactMessages(filter, page, limit, search);
    res.status(200).json({
      success: true,
      ...data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark support message as read (Admin only)
// @route   PATCH /api/user/contact/:id/read
// @access  Private/Admin
const markContactMessageRead = async (req, res) => {
  try {
    const message = await userService.markContactMessageRead(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark support message as resolved (Admin only)
// @route   PATCH /api/user/contact/:id/resolve
// @access  Private/Admin
const markContactMessageResolved = async (req, res) => {
  try {
    const { status } = req.body;
    const message = await userService.markContactMessageResolved(req.params.id, status || 'resolved');
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete support message (Admin only)
// @route   DELETE /api/user/contact/:id
// @access  Private/Admin
const deleteContactMessage = async (req, res) => {
  try {
    const message = await userService.deleteContactMessage(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.status(200).json({ success: true, message: 'Support message deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

module.exports = { 
  updateProfile, 
  updatePassword, 
  getAllUsers, 
  getAssignableUsers, 
  updateUserRole, 
  updateUserChatAccess,
  submitContactMessage,
  getContactMessages,
  markContactMessageRead,
  markContactMessageResolved,
  deleteContactMessage
};
