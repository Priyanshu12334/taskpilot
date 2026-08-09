const Notification = require('../models/Notification');

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const role = req.user.role?.toLowerCase();
    
    if (role === 'admin') {
      // Reuse Activity Log for Admin Notifications (as requested)
      // Find all tasks that have "Completed" in their activity log
      const Task = require('../models/Task');
      const completionLogs = await Task.aggregate([
        { $unwind: "$activityLog" },
        { 
          $match: { 
            "activityLog.action": { $regex: /Status changed to Completed|Task completed/i },
            "activityLog.user": { $ne: req.user.name } // Do not notify admin for their own actions
          } 
        },
        { $sort: { "activityLog.timestamp": -1 } },
        { $limit: 20 },
        {
          $project: {
            _id: "$activityLog._id",
            message: { $concat: ["$activityLog.user", " completed '", "$title", "'"] },
            createdAt: "$activityLog.timestamp",
            isRead: { $literal: false }, // Dynamic virtual read status
            type: { $literal: "completion" }
          }
        }
      ]);
      
      // Fetch stored registration & contact notifications for admin
      const registrationNotifications = await Notification.find({
        user: req.user._id,
        type: { $in: ['registration', 'contact'] }
      }).lean();

      // Get cleared notifications list for user
      const User = require('../models/User');
      const adminUserDoc = await User.findById(req.user._id).select('clearedNotifications');
      const clearedSet = new Set((adminUserDoc?.clearedNotifications || []).map(id => id.toString()));

      // Filter out cleared virtual completion notifications
      const filteredCompletionLogs = completionLogs.filter(log => !clearedSet.has(log._id.toString()));

      // Combine and sort by createdAt descending
      const allNotifications = [...filteredCompletionLogs, ...registrationNotifications];
      allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json(allNotifications);
    }

    // Default behavior for Members: Use existing Notification model
    const notifications = await Notification.find({ user: req.user._id })
      .populate('sender', 'name role email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read for logged in user
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ 
      message: 'All notifications marked as read',
      count: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a single notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const role = req.user.role?.toLowerCase();
    const notifId = req.params.id;

    // Check if it is a stored notification
    const storedNotif = await Notification.findOne({ _id: notifId, user: req.user._id });
    if (storedNotif) {
      await storedNotif.deleteOne();
      return res.status(200).json({ message: 'Notification cleared' });
    }

    // For virtual completion activity notifications or admin, save to user.clearedNotifications
    if (role === 'admin') {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { clearedNotifications: notifId }
      });
      return res.status(200).json({ message: 'Notification cleared' });
    }

    res.status(404).json({ message: 'Notification not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all notifications for logged in user
// @route   DELETE /api/notifications/clear-all
// @access  Private
const clearAllNotifications = async (req, res) => {
  try {
    const role = req.user.role?.toLowerCase();

    // Delete all stored notifications for this user
    await Notification.deleteMany({ user: req.user._id });

    if (role === 'admin') {
      const Task = require('../models/Task');
      const completionLogs = await Task.aggregate([
        { $unwind: "$activityLog" },
        { 
          $match: { 
            "activityLog.action": { $regex: /Status changed to Completed|Task completed/i },
            "activityLog.user": { $ne: req.user.name }
          } 
        },
        { $project: { _id: "$activityLog._id" } }
      ]);
      const clearedIds = completionLogs.map(l => l._id.toString());
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { clearedNotifications: { $each: clearedIds } }
      });
    }

    res.status(200).json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
};
