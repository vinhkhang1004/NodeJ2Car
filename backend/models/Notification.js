const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ['order', 'review', 'chat'],
        },
        message: {
            type: String,
            required: true,
        },
        link: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            required: true,
            default: false,
        },
        referenceId: {
            type: String, // ID of order, product or user
        }
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
