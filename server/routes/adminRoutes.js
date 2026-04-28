const express = require('express');
const router = express.Router();
const { promoteUser, blockUser, unblockUser, getAdminStats } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes require login and Admin role
router.use(protect);
router.use(admin);

// New unified routes
router.put('/promote-user/:id', promoteUser);
router.put('/block-user/:id', blockUser);
router.put('/unblock-user/:id', unblockUser);
router.get('/stats', getAdminStats);

// Backward compatibility aliases
router.put('/approve-user/:id', promoteUser);
router.put('/reject-user/:id', blockUser);

module.exports = router;
