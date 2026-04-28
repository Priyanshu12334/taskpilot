const express = require('express');
const { updateProfile, updatePassword, getAllUsers, updateUserRole, updateUserChatAccess } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Both routes are strictly protected by JWT verification
router.put('/update', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.get('/all', protect, getAllUsers);
router.patch('/:id/role', protect, admin, updateUserRole);
router.patch('/:id/chat-access', protect, admin, updateUserChatAccess);

module.exports = router;
