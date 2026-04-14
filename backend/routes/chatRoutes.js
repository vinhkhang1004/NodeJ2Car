const express = require('express');
const router = express.Router();
const { 
    getChatHistory, 
    getAdminConversations, 
    markAsRead,
    getChatSettings,
    toggleChatOnline
} = require('../controllers/chatController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/settings', getChatSettings);
router.put('/settings/toggle', protect, admin, toggleChatOnline);
router.get('/:userId', protect, getChatHistory);
router.get('/admin/conversations', protect, admin, getAdminConversations);
router.put('/read/:userId', protect, admin, markAsRead);


module.exports = router;
