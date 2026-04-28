const authService = require('../services/authService');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, purpose } = req.body;

    if (!purpose) {
      return res.status(400).json({ message: 'Purpose of joining is required' });
    }

    // Check if user already exists using service
    const userExists = await authService.findUserByEmail(email);

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create the new user using service
    const user = await authService.createUser({
      name,
      email,
      password,
      purpose,
    });

    if (user) {
      res.status(201).json({
        message: 'User registered successfully',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data format' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user including hidden password via service
    const user = await authService.findUserForLogin(email);

    if (user && (await user.matchPassword(password))) {
      // Check if user is blocked (replaces the old rejected role check)
      if (user.status === 'blocked' || user.role?.toLowerCase() === 'rejected') {
         return res.status(403).json({ 
            message: 'Your account access has been revoked or rejected by an administrator.' 
         });
      }

      // Backward compatibility: If user is Pending, they are now simpleUser
      const effectiveRole = user.role?.toLowerCase() === 'pending' ? 'simpleUser' : user.role;

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: effectiveRole,
        status: user.status,
        canAccessChat: user.canAccessChat,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await authService.findUserById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        canAccessChat: user.canAccessChat,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.status(200).json({ message: 'User successfully logged out' });
};

module.exports = { registerUser, loginUser, getUserProfile, logoutUser };
