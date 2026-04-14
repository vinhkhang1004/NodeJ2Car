const Coupon = require('../models/Coupon');
const Category = require('../models/Category');


// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({}).populate('applicableCategories', 'name');
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get public active coupons
// @route   GET /api/coupons/public
// @access  Public
const getPublicCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({ 
            isActive: true, 
            expiryDate: { $gt: new Date() } 
        })
        .select('code discountType discountAmount minPurchase expiryDate usageLimit usedCount')
        .sort({ createdAt: -1 });
        
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a coupon

// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
    try {
        const { 
            code, discountType, discountAmount, minPurchase, 
            expiryDate, usageLimit, applicableCategories, isActive 
        } = req.body;

        const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
        if (couponExists) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountType,
            discountAmount,
            minPurchase,
            expiryDate,
            usageLimit,
            applicableCategories,
            isActive
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (coupon) {
            coupon.discountType = req.body.discountType || coupon.discountType;
            coupon.discountAmount = req.body.discountAmount || coupon.discountAmount;
            coupon.minPurchase = req.body.minPurchase !== undefined ? req.body.minPurchase : coupon.minPurchase;
            coupon.expiryDate = req.body.expiryDate || coupon.expiryDate;
            coupon.usageLimit = req.body.usageLimit || coupon.usageLimit;
            coupon.applicableCategories = req.body.applicableCategories || coupon.applicableCategories;
            coupon.isActive = req.body.isActive !== undefined ? req.body.isActive : coupon.isActive;

            const updatedCoupon = await coupon.save();
            res.json(updatedCoupon);
        } else {
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (coupon) {
            await coupon.deleteOne();
            res.json({ message: 'Coupon removed' });
        } else {
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res) => {
    try {
        const { code, cartItems, itemsTotal } = req.body;
        const cleanCode = code ? code.trim().toUpperCase() : '';
        console.log('Validating coupon:', cleanCode, 'Total:', itemsTotal);

        const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });


        if (!coupon) {
            return res.status(404).json({ message: 'Mã giảm giá không tồn tại hoặc đã hết hạn' });
        }

        // Check expiry
        if (new Date() > coupon.expiryDate) {
            return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
        }

        // Check global limit
        if (coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Mã giảm giá này đã được sử dụng hết số lượt cho phép' });
        }

        // Check per-user limit
        const alreadyUsed = (coupon.usedBy || []).some(id => id && req.user?._id && id.toString() === req.user._id.toString());
        if (alreadyUsed) {
            return res.status(400).json({ message: 'Bạn đã sử dụng mã giảm giá này rồi' });
        }

        // Check min purchase
        const minP = Number(coupon.minPurchase) || 0;
        const total = Number(itemsTotal) || 0;

        if (total < minP) {
            return res.status(400).json({ 
                message: `Đơn hàng phải tối thiểu ${minP.toLocaleString('vi-VN')}₫ để sử dụng mã này` 
            });
        }


        // Check category restriction (if any)
        if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
            console.log('Checking categories for coupon:', coupon.code);
            const hasApplicableItem = cartItems.some(item => {
                const itemCatId = item.categoryId || item.category?._id || item.category;
                return coupon.applicableCategories.some(catId => catId.toString() === itemCatId?.toString());
            });

            if (!hasApplicableItem) {
                return res.status(400).json({ message: 'Mã giảm giá này không áp dụng cho các sản phẩm trong giỏ hàng của bạn' });
            }
        }

        console.log('Coupon valid:', coupon.code);
        res.json({
            _id: coupon._id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountAmount: coupon.discountAmount,
        });
    } catch (error) {
        console.error('Validation Error:', error);
        res.status(500).json({ message: 'Lỗi server khi kiểm tra mã: ' + error.message });
    }
};


module.exports = {
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    getPublicCoupons,
};

