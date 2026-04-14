const express = require('express');
const router = express.Router();
const { 
    getNotifications, 
    markAsRead, 
    markAllAsRead 
} = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getNotifications);
router.put('/readall', protect, admin, markAllAsRead);
router.put('/:id/read', protect, admin, markAsRead);

module.exports = router;
