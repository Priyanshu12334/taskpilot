const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/chatController');
const { protect, approved } = require('../middleware/authMiddleware');

// All chat routes are protected and require approval
router.use(protect);
router.use(approved);

router.post('/send', sendMessage);
router.get('/:taskId', getMessages);

module.exports = router;
