const mongoose = require('mongoose');

const couponSchema = mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        discountType: {
            type: String,
            required: true,
            enum: ['Percentage', 'FixedAmount'],
            default: 'Percentage',
        },
        discountAmount: {
            type: Number,
            required: true,
            default: 0,
        },
        minPurchase: {
            type: Number,
            required: true,
            default: 0,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        usageLimit: {
            type: Number,
            required: true,
            default: 100, // Total global uses
        },
        usedCount: {
            type: Number,
            required: true,
            default: 0,
        },
        applicableCategories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Category',
            }
        ],
        usedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        ],
        isActive: {
            type: Boolean,
            required: true,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Virtual for checking if expired
couponSchema.virtual('isExpired').get(function () {
    return Date.now() > this.expiryDate;
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
