const mongoose = require('mongoose');

const autoPartSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        // Reference to Category model (ObjectId) — replaces plain string
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            default: 0,
            min: [0, 'Price must be non-negative'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        stock: {
            type: Number,
            required: [true, 'Stock is required'],
            default: 0,
            min: [0, 'Stock must be non-negative'],
        },
        imageUrl: {
            type: String,
            required: [true, 'Image URL is required'],
        },
        brand: {
            type: String,
            required: [true, 'Brand is required'],
            trim: true,
        },
        sku: {
            type: String,
            unique: true,
            sparse: true,  // allow null/undefined for backward compat
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Text index for full-text search
autoPartSchema.index({ name: 'text', brand: 'text', description: 'text' });

const AutoPart = mongoose.model('AutoPart', autoPartSchema);

module.exports = AutoPart;
