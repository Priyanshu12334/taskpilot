const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Headers and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token
      token = req.headers.authorization.split(' ')[1];

      // Decode the token using the secret key to get the payload (which contains user id)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from database excluding the password and attach to req
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // 🛡️ SECURITY CHECK: Force logout if user is blocked
      if (req.user.status === 'blocked') {
        console.warn(`[protect] 🚫 User "${req.user.name}" is BLOCKED. Denying access.`);
        return res.status(403).json({ 
          message: 'Account blocked by admin', 
          errorCode: 'ACCOUNT_BLOCKED' 
        });
      }

      console.log(`[protect] ✅ User authenticated: ${req.user.name} | Role: ${req.user.role}`);
      next();
    } catch (error) {
      console.error('[protect] ❌ Token verification failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check if the user is an admin
const admin = (req, res, next) => {
  const role = req.user?.role?.toLowerCase();
  if (req.user && role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: `Access denied. Admin role required.` });
  }
};

// Middleware to check if user has at least simpleUser access (Legacy 'approved')
const approved = (req, res, next) => {
  const role = req.user?.role?.toLowerCase();
  const status = req.user?.status;

  if (status === 'blocked' || role === 'rejected') {
    return res.status(403).json({ 
      message: 'Account blocked by admin', 
      errorCode: 'ACCOUNT_BLOCKED' 
    });
  }

  // New system: simpleUser, member, and admin are all "approved" to enter the app
  // But they might have different feature sets.
  if (['admin', 'member', 'simpleuser', 'pending'].includes(role)) {
    return next();
  }

  res.status(403).json({ message: 'Access denied.' });
};

module.exports = { protect, admin, approved };
