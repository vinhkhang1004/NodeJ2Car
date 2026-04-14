const Message = require('../models/Message');
const ChatSettings = require('../models/ChatSettings');

// @desc    Get chat history for a user
// @route   GET /api/chat/:userId
// @access  Private/Admin
const getChatHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: userId },
                { guestId: userId },
                { receiver: userId }
            ]
        }).sort({ createdAt: 1 });
        
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all unique conversations for Admin
// @route   GET /api/chat/admin/conversations
// @access  Private/Admin
const getAdminConversations = async (req, res) => {
    try {
        // Group by sender or guestId to get unique users
        const conversations = await Message.aggregate([
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: { $ifNull: ["$sender", "$guestId"] },
                    lastMessage: { $first: "$message" },
                    lastMessageTime: { $first: "$createdAt" },
                    senderName: { $first: "$senderName" },
                    unreadCount: {
                        $sum: { $cond: [{ $and: [{ $eq: ["$isRead", false] }, { $eq: ["$isAdmin", false] }] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { lastMessageTime: -1 }
            }
        ]);
        
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/read/:userId
// @access  Private/Admin
const markAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        // If admin is reading customer messages
        await Message.updateMany(
            { 
                $or: [{ sender: userId }, { guestId: userId }],
                isRead: false,
                isAdmin: false
            },
            { isRead: true, status: 'seen' }
        );
        // If customer is reading admin messages
        await Message.updateMany(
            { 
                receiver: userId, // or where roomId matches
                isRead: false,
                isAdmin: true
            },
            { isRead: true, status: 'seen' }
        );
        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get global chat settings
// @route   GET /api/chat/settings
// @access  Public
const getChatSettings = async (req, res) => {
    try {
        console.log('Fetching ChatSettings...');
        let settings = await ChatSettings.findOne();
        if (!settings) {
            console.log('No settings found, creating default...');
            settings = await ChatSettings.create({ isSupportOnline: true });
        }
        res.json(settings);
    } catch (error) {
        console.error('getChatSettings Error 상세:', error);
        res.status(500).json({ message: error.message });
    }
};


// @desc    Toggle global chat online status
// @route   PUT /api/chat/settings/toggle
// @access  Private/Admin
const toggleChatOnline = async (req, res) => {
    try {
        let settings = await ChatSettings.findOne();
        if (!settings) {
            settings = await ChatSettings.create({ isSupportOnline: true });
        }
        settings.isSupportOnline = !settings.isSupportOnline;
        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getChatHistory,
    getAdminConversations,
    markAsRead,
    getChatSettings,
    toggleChatOnline
};

