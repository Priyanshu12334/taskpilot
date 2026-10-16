const express = require('express');
const { 
  updateProfile, 
  updatePassword, 
  uploadProfilePhoto,
  getAllUsers, 
  getAssignableUsers, 
  updateUserRole, 
  updateUserChatAccess,
  submitContactMessage,
  getContactMessages,
  markContactMessageRead,
  markContactMessageResolved,
  deleteContactMessage
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const { passwordLimiter, contactLimiter } = require('../middleware/rateLimiter');
const { uploadProfilePhotoFile, handleProfilePhotoUploadError } = require('../middleware/profilePhotoUpload');

const router = express.Router();

// Both routes are strictly protected by JWT verification
router.put('/update', protect, updateProfile);
router.put('/password', protect, passwordLimiter, updatePassword);
router.post('/profile-photo', protect, uploadProfilePhotoFile, handleProfilePhotoUploadError, uploadProfilePhoto);
router.get('/all', protect, getAllUsers);
router.get('/assignable', protect, getAssignableUsers);
router.post('/contact', protect, contactLimiter, submitContactMessage);
router.get('/contact', protect, admin, getContactMessages);
router.patch('/contact/:id/read', protect, admin, markContactMessageRead);
router.patch('/contact/:id/resolve', protect, admin, markContactMessageResolved);
router.delete('/contact/:id', protect, admin, deleteContactMessage);
router.patch('/:id/role', protect, admin, updateUserRole);
router.patch('/:id/chat-access', protect, admin, updateUserChatAccess);

module.exports = router;
