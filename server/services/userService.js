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

module.exports = {
  findUserById,
  updateUserProfile,
  updateUserPassword,
  getAllUsers,
  updateUserRole,
  updateUserChatAccess
};
