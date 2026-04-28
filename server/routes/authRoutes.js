const express = require('express');
const { registerUser, loginUser, getUserProfile, logoutUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protect the profile route so only authenticated users can access it
router.get('/profile', protect, getUserProfile);

module.exports = router;
