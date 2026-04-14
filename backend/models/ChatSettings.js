const mongoose = require('mongoose');

const chatSettingsSchema = mongoose.Schema(
    {
        isSupportOnline: {
            type: Boolean,
            required: true,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const ChatSettings = mongoose.model('ChatSettings', chatSettingsSchema);

module.exports = ChatSettings;
