const User = require('../models/User');

const findUserById = async (id) => {
  // We explicitly select +password in case we need it for old password verification
  return await User.findById(id).select('+password');
};

const updateUserProfile = async (user, name, email) => {
  user.name = name || user.name;
  user.email = email || user.email;
  return await user.save();
};

const updateUserPassword = async (user, newPassword) => {
  user.password = newPassword;
  return await user.save();
};

const getAllUsers = async () => {
  return await User.find().select('name email role canAccessChat purpose status');
};

const getAssignableUsers = async () => {
  return await User.find({
    role: { $in: ['member', 'Member'] },
    status: { $ne: 'blocked' }
  }).select('name email role canAccessChat purpose status');
};

const updateUserRole = async (userId, role) => {
  const user = await User.findById(userId);
  if (!user) return null;
  user.role = role;
  return await user.save();
};

const updateUserChatAccess = async (userId, canAccessChat) => {
  const user = await User.findById(userId);
  if (!user) return null;
  user.canAccessChat = canAccessChat;
  return await user.save();
};

const createContactMessage = async (senderId, name, email, role, queryType, subject, message) => {
  const ContactMessage = require('../models/ContactMessage');
  return await ContactMessage.create({
    sender: senderId,
    name,
    email,
    role,
    queryType,
    subject,
    message
  });
};

const getContactMessages = async (filter = {}, page = 1, limit = 10, search = '') => {
  const ContactMessage = require('../models/ContactMessage');

  let matchQuery = { ...filter };
  if (search && search.trim()) {
    matchQuery.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } },
      { subject: { $regex: search.trim(), $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;
  const total = await ContactMessage.countDocuments(matchQuery);
  const unreadCount = await ContactMessage.countDocuments({ isRead: false });

  const messages = await ContactMessage.find(matchQuery)
    .populate('sender', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    messages,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    unreadCount
  };
};

const markContactMessageRead = async (messageId) => {
  const ContactMessage = require('../models/ContactMessage');
  return await ContactMessage.findByIdAndUpdate(
    messageId,
    { $set: { isRead: true } },
    { new: true }
  ).populate('sender', 'name email role');
};

const markContactMessageResolved = async (messageId, status = 'resolved') => {
  const ContactMessage = require('../models/ContactMessage');
  return await ContactMessage.findByIdAndUpdate(
    messageId,
    { $set: { status } },
    { new: true }
  ).populate('sender', 'name email role');
};

const deleteContactMessage = async (messageId) => {
  const ContactMessage = require('../models/ContactMessage');
  return await ContactMessage.findByIdAndDelete(messageId);
};

module.exports = {
  findUserById,
  updateUserProfile,
  updateUserPassword,
  getAllUsers,
  getAssignableUsers,
  updateUserRole,
  updateUserChatAccess,
  createContactMessage,
  getContactMessages,
  markContactMessageRead,
  markContactMessageResolved,
  deleteContactMessage
};
