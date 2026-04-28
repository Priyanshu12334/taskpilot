const Chat = require('../models/Chat');
const Task = require('../models/Task');

// @desc    Send a message for a specific task
// @route   POST /api/chat/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { taskId, message } = req.body;

    if (!taskId || !message) {
      return res.status(400).json({ message: 'Task ID and message are required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Permission Check: Admin OR Assigned User
    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    const isAssigned = task.assignedTo?.toString() === req.user._id.toString();

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: 'Not allowed: You must be an Admin or the assigned user to chat here.' });
    }

    const chatMessage = await Chat.create({
      taskId,
      sender: req.user._id,
      message
    });

    // Populate sender info for frontend
    const populatedMessage = await Chat.findById(chatMessage._id).populate('sender', 'name');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all messages for a specific task
// @route   GET /api/chat/:taskId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Permission Check: Admin OR Assigned User
    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    const isAssigned = task.assignedTo?.toString() === req.user._id.toString();

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: 'Not allowed: Access to this chat is restricted.' });
    }

    const messages = await Chat.find({ taskId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages
};
