const mongoose = require('mongoose');

const autoPartSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        description: {
            type: String,
            required: true,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        brand: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const AutoPart = mongoose.model('AutoPart', autoPartSchema);

module.exports = AutoPart;
