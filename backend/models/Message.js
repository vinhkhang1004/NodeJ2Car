const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // null for guest
        },
        guestId: {
            type: String,
            required: false, // for non-logged in users
        },
        senderName: {
            type: String,
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // can be multiple admins
        },
        message: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ['sent', 'seen'],
            default: 'sent',
        },

    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
