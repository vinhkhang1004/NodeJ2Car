const AutoPart = require('../models/AutoPart.js');

// @desc    Fetch all auto parts with optional search
// @route   GET /api/parts
// @access  Public
// ..
const getParts = async (req, res) => {
    try {
        const pageSize = Number(req.query.limit) || 12;
        const page = Number(req.query.page) || 1;

        const keyword = req.query.keyword
            ? {
                  name: {
                      $regex: req.query.keyword,
                      $options: 'i',
                  },
              }
            : {};

        const category = req.query.category ? { category: req.query.category } : {};
        const brand = req.query.brand ? { brand: req.query.brand } : {};
        
        const minPrice = Number(req.query.minPrice) || 0;
        const maxPrice = Number(req.query.maxPrice) || Infinity;
        const priceFilter = { price: { $gte: minPrice, $lte: maxPrice === Infinity ? 1000000000 : maxPrice } };

        const query = { ...keyword, ...category, ...brand, ...priceFilter };

        const count = await AutoPart.countDocuments(query);
        const parts = await AutoPart.find(query)
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 });

        res.json({
            parts,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single auto part
// @route   GET /api/parts/:id
// @access  Public
const getPartById = async (req, res) => {
    try {
        const part = await AutoPart.findById(req.params.id);

        if (part) {
            res.json(part);
        } else {
            res.status(404).json({ message: 'Auto part not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new part
// @route   POST /api/parts
// @access  Private/Admin
const createPart = async (req, res) => {
    try {
        const { name, category, price, description, stock, imageUrl, brand } = req.body;
        const part = new AutoPart({ name, category, price, description, stock, imageUrl, brand });
        const createdPart = await part.save();
        res.status(201).json(createdPart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a part
// @route   PUT /api/parts/:id
// @access  Private/Admin
const updatePart = async (req, res) => {
    try {
        const { name, category, price, description, stock, imageUrl, brand } = req.body;
        const part = await AutoPart.findById(req.params.id);

        if (part) {
            part.name = name;
            part.category = category;
            part.price = price;
            part.description = description;
            part.stock = stock;
            part.imageUrl = imageUrl;
            part.brand = brand;

            const updatedPart = await part.save();
            res.json(updatedPart);
        } else {
            res.status(404).json({ message: 'Auto part not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a part
// @route   DELETE /api/parts/:id
// @access  Private/Admin
const deletePart = async (req, res) => {
    try {
        const part = await AutoPart.findById(req.params.id);

        if (part) {
            await AutoPart.deleteOne({ _id: part._id });
            res.json({ message: 'Part removed' });
        } else {
            res.status(404).json({ message: 'Auto part not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Admin Stats
// @route   GET /api/parts/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        // We import User dynamically to avoid circular dependencies or just require it at the top
        const User = require('../models/User.js');
        
        const countParts = await AutoPart.countDocuments({});
        const countUsers = await User.countDocuments({});
        
        res.json({
            totalParts: countParts,
            totalUsers: countUsers,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new review
// @route   POST /api/parts/:id/reviews
// @access  Private
const createPartReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const part = await AutoPart.findById(req.params.id);

        if (part) {
            const alreadyReviewed = part.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Product already reviewed' });
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
            };

            part.reviews.push(review);
            part.numReviews = part.reviews.length;
            part.rating =
                part.reviews.reduce((acc, item) => item.rating + acc, 0) /
                part.reviews.length;

            await part.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Auto part not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user review
// @route   PUT /api/parts/:partId/reviews/:reviewId
// @access  Private
const updateUserReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const part = await AutoPart.findById(req.params.partId);

        if (part) {
            const review = part.reviews.id(req.params.reviewId);
            
            if (review) {
                // Check if user is the owner
                if (review.user.toString() !== req.user._id.toString()) {
                    return res.status(401).json({ message: 'Not authorized to update this review' });
                }

                // Check if Admin has replied
                if (review.reply) {
                    return res.status(400).json({ message: 'Cannot edit review after admin response' });
                }

                review.rating = Number(rating);
                review.comment = comment;

                // Recalculate average rating
                part.rating =
                    part.reviews.reduce((acc, item) => item.rating + acc, 0) /
                    part.reviews.length;

                await part.save();
                res.json({ message: 'Review updated' });
            } else {
                res.status(404).json({ message: 'Review not found' });
            }
        } else {
            res.status(404).json({ message: 'Part not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reviews from all products (Admin only)
// @route   GET /api/parts/admin/reviews
// @access  Private/Admin
const getAdminReviews = async (req, res) => {
    try {
        const parts = await AutoPart.find({}).select('name reviews');
        
        // Flatten reviews and add product context
        let allReviews = [];
        parts.forEach(part => {
            part.reviews.forEach(review => {
                allReviews.push({
                    _id: review._id,
                    partId: part._id,
                    partName: part.name,
                    name: review.name,
                    rating: review.rating,
                    comment: review.comment,
                    reply: review.reply,
                    createdAt: review.createdAt,
                    user: review.user
                });
            });
        });

        // Sort by date descending
        allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(allReviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update review reply (Admin only)
// @route   POST /api/parts/:partId/reviews/:reviewId/reply
// @access  Private/Admin
const updateReviewReply = async (req, res) => {
    try {
        const { reply } = req.body;
        const part = await AutoPart.findById(req.params.partId);

        if (part) {
            const review = part.reviews.id(req.params.reviewId);
            if (review) {
                review.reply = reply;
                await part.save();
                res.json({ message: 'Reply updated' });
            } else {
                res.status(404).json({ message: 'Review not found' });
            }
        } else {
            res.status(404).json({ message: 'Part not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete review
// @route   DELETE /api/parts/:partId/reviews/:reviewId
// @access  Private
const deleteReview = async (req, res) => {
    try {
        const part = await AutoPart.findById(req.params.partId);

        if (part) {
            const review = part.reviews.id(req.params.reviewId);
            if (review) {
                // Check if user is admin or the owner
                if (!req.user.isAdmin && review.user.toString() !== req.user._id.toString()) {
                    return res.status(401).json({ message: 'Not authorized to delete this review' });
                }

                // Use pull method to remove subdocument
                part.reviews.pull(req.params.reviewId);
                
                // Recalculate rating and numReviews
                part.numReviews = part.reviews.length;
                if (part.numReviews > 0) {
                    part.rating = part.reviews.reduce((acc, item) => item.rating + acc, 0) / part.reviews.length;
                } else {
                    part.rating = 0;
                }

                await part.save();
                res.json({ message: 'Review deleted' });
            } else {
                res.status(404).json({ message: 'Review not found' });
            }
        } else {
            res.status(404).json({ message: 'Part not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all unique brands (Public)
// @route   GET /api/parts/brands
// @access  Public
const getBrands = async (req, res) => {
    try {
        const brands = await AutoPart.distinct('brand');
        res.json(brands);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getParts,
    getPartById,
    createPart,
    updatePart,
    deletePart,
    getAdminStats,
    createPartReview,
    updateUserReview,
    getAdminReviews,
    updateReviewReply,
    deleteReview,
    getBrands,
};



