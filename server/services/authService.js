const User = require('../models/User');

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const createUser = async (userData) => {
  return await User.create(userData);
};

const findUserForLogin = async (email) => {
  // Explicitly select the password for authentication checks
  return await User.findOne({ email }).select('+password');
};

const findUserById = async (id) => {
  return await User.findById(id);
};

module.exports = {
  findUserByEmail,
  createUser,
  findUserForLogin,
  findUserById
};
