const AutoPart = require('../models/AutoPart.js');
const Notification = require('../models/Notification.js');
const axios = require('axios');

// Helper to decode VIN using NHTSA API with local fallback
const decodeVinHelper = async (vin) => {
    try {
        if (!vin || vin.length < 10) return null;
        const response = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`);
        if (response.data && response.data.Results && response.data.Results.length > 0) {
            const data = response.data.Results[0];
            if (data.Make) {
                return {
                    make: data.Make,
                    model: data.Model || '',
                    year: data.ModelYear ? Number(data.ModelYear) : null
                };
            }
        }
    } catch (error) {
        console.error('NHTSA VIN decoding error:', error.message);
    }
    // Fallback Mock parsing for local/demonstration purposes
    const mockVINs = {
        'J2CARTOYOTACAMRY': { make: 'Toyota', model: 'Camry', year: 2020 },
        'J2CARHONDACIVIC9': { make: 'Honda', model: 'Civic', year: 2022 },
        'J2CARFORDMUSTANG': { make: 'Ford', model: 'Mustang', year: 2018 }
    };
    const cleanVin = vin.toUpperCase().replace(/[^A-Z0-9]/g, '');
    for (const [key, value] of Object.entries(mockVINs)) {
        if (cleanVin.includes(key)) {
            return value;
        }
    }
    return null;
};

// @desc    Decode VIN to vehicle info
// @route   GET /api/products/decode-vin/:vin
// @access  Public
const decodeVinEndpoint = async (req, res) => {
    try {
        const { vin } = req.params;
        const decoded = await decodeVinHelper(vin.toUpperCase());
        if (!decoded) {
            return res.status(404).json({ message: 'Không thể giải mã số VIN này hoặc thông tin không tồn tại' });
        }
        res.json(decoded);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all unique compatible cars (brands, models, years)
// @route   GET /api/products/compatibilities
// @access  Public
const getCompatibilities = async (req, res) => {
    try {
        const parts = await AutoPart.find({ 'carCompatibilities.0': { $exists: true } }).select('carCompatibilities');
        const brands = new Set();
        const modelsByBrand = {};
        const years = new Set();

        parts.forEach(part => {
            (part.carCompatibilities || []).forEach(compat => {
                if (compat.carBrand) {
                    const b = compat.carBrand.trim();
                    brands.add(b);
                    if (!modelsByBrand[b]) modelsByBrand[b] = new Set();
                    if (compat.carModel) {
                        modelsByBrand[b].add(compat.carModel.trim());
                    }
                }
                if (compat.carYear) {
                    years.add(compat.carYear);
                }
            });
        });

        // Seed some common brands and models as fallback
        const standardBrands = ['Toyota', 'Honda', 'Ford', 'Hyundai', 'Kia', 'BMW', 'Mercedes-Benz', 'Mazda'];
        standardBrands.forEach(b => brands.add(b));

        res.json({
            brands: Array.from(brands).sort(),
            modelsByBrand: Object.fromEntries(
                Object.entries(modelsByBrand).map(([k, v]) => [k, Array.from(v).sort()])
            ),
            years: Array.from(years).sort((a, b) => b - a)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// @desc    Fetch all auto parts with optional search, filter, pagination
// @route   GET /api/products
// @access  Public
// ..
const getProducts = async (req, res) => {
    try {
        const { keyword, category, brand, minPrice, maxPrice, carBrand, carModel, carYear, partType, vin, page = 1, limit = 12 } = req.query;

        const filter = {};

        if (keyword) {
            filter.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { brand: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
            ];
        }
        if (category) {
            const mongoose = require('mongoose');
            if (mongoose.Types.ObjectId.isValid(category)) {
                filter.category = category;
            } else {
                // Find category by name or slug
                const Category = require('../models/Category.js');
                const cat = await Category.findOne({
                    $or: [
                        { name: { $regex: new RegExp(`^${category}$`, 'i') } },
                        { slug: { $regex: new RegExp(`^${category.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')}$`, 'i') } }
                    ]
                });
                if (cat) {
                    filter.category = cat._id;
                } else {
                    // Force no results if category name was provided but not found
                    filter.category = new mongoose.Types.ObjectId();
                }
            }
        }
        if (brand) filter.brand = { $regex: brand, $options: 'i' };
        if (partType) filter.partType = partType;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Vehicle compatibility filtering
        const compatConditions = {};
        if (carBrand) compatConditions.carBrand = { $regex: new RegExp(`^${carBrand}$`, 'i') };
        if (carModel) compatConditions.carModel = { $regex: new RegExp(`^${carModel}$`, 'i') };
        if (carYear) compatConditions.carYear = Number(carYear);

        if (Object.keys(compatConditions).length > 0) {
            filter.carCompatibilities = { $elemMatch: compatConditions };
        }

        // VIN Lookup handling
        if (vin) {
            const vinStr = String(vin).trim().toUpperCase();
            const decoded = await decodeVinHelper(vinStr);

            const vinConditions = [
                { compatibleVINs: vinStr }
            ];

            if (decoded && decoded.make) {
                const compatMatch = {
                    carBrand: { $regex: new RegExp(`^${decoded.make}$`, 'i') }
                };
                if (decoded.model) {
                    compatMatch.carModel = { $regex: new RegExp(`^${decoded.model}$`, 'i') };
                }
                if (decoded.year) {
                    compatMatch.carYear = decoded.year;
                }
                vinConditions.push({
                    carCompatibilities: {
                        $elemMatch: compatMatch
                    }
                });
            }

            if (filter.$or) {
                const existingOr = filter.$or;
                delete filter.$or;
                filter.$and = [
                    { $or: existingOr },
                    { $or: vinConditions }
                ];
            } else {
                filter.$or = vinConditions;
            }
        }

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [products, total] = await Promise.all([
            AutoPart.find(filter)
                .populate('category', 'name slug')
                .populate('createdBy', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            AutoPart.countDocuments(filter),
        ]);

        res.json({
            products,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await AutoPart.findById(req.params.id)
            .populate('category', 'name slug description')
            .populate('createdBy', 'name email');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const { name, category, price, description, stock, imageUrl, brand, sku, isActive, carCompatibilities, partType, compatibleVINs } = req.body;

        // Validate category exists
        const Category = require('../models/Category.js');
        const cat = await Category.findById(category);
        if (!cat) {
            return res.status(400).json({ message: 'Invalid category ID' });
        }

        // Check duplicate SKU
        if (sku) {
            const skuExists = await AutoPart.findOne({ sku });
            if (skuExists) {
                return res.status(400).json({ message: 'SKU already exists' });
            }
        }

        const product = new AutoPart({
            name,
            category,
            price: Number(price),
            description,
            stock: Number(stock),
            imageUrl,
            brand,
            sku: sku || undefined,
            isActive: isActive !== undefined ? isActive : true,
            createdBy: req.user._id,
            carCompatibilities: carCompatibilities ? (typeof carCompatibilities === 'string' ? JSON.parse(carCompatibilities) : carCompatibilities) : [],
            partType: partType || 'Aftermarket',
            compatibleVINs: compatibleVINs ? (typeof compatibleVINs === 'string' ? compatibleVINs.split(',').map(v => v.trim()) : compatibleVINs) : [],
        });

        const created = await product.save();
        await created.populate('category', 'name slug');
        res.status(201).json(created);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const product = await AutoPart.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const { name, category, price, description, stock, imageUrl, brand, sku, isActive, carCompatibilities, partType, compatibleVINs } = req.body;

        // Validate category if changed
        if (category && category !== String(product.category)) {
            const Category = require('../models/Category.js');
            const cat = await Category.findById(category);
            if (!cat) {
                return res.status(400).json({ message: 'Invalid category ID' });
            }
        }

        // Check duplicate SKU (exclude self)
        if (sku && sku !== product.sku) {
            const skuExists = await AutoPart.findOne({ sku, _id: { $ne: product._id } });
            if (skuExists) {
                return res.status(400).json({ message: 'SKU already exists' });
            }
        }

        product.name = name ?? product.name;
        product.category = category ?? product.category;
        product.price = price !== undefined ? Number(price) : product.price;
        product.description = description ?? product.description;
        product.stock = stock !== undefined ? Number(stock) : product.stock;
        product.imageUrl = imageUrl ?? product.imageUrl;
        product.brand = brand ?? product.brand;
        if (sku !== undefined) product.sku = sku;
        if (isActive !== undefined) product.isActive = isActive;
        if (carCompatibilities !== undefined) {
            product.carCompatibilities = typeof carCompatibilities === 'string' ? JSON.parse(carCompatibilities) : carCompatibilities;
        }
        if (partType !== undefined) {
            product.partType = partType;
        }
        if (compatibleVINs !== undefined) {
            product.compatibleVINs = typeof compatibleVINs === 'string' ? compatibleVINs.split(',').map(v => v.trim()) : compatibleVINs;
        }

        const updated = await product.save();
        await updated.populate('category', 'name slug');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await AutoPart.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await AutoPart.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Admin Stats (products + users + categories)
// @route   GET /api/products/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const User = require('../models/User.js');
        const Category = require('../models/Category.js');

        const [countProducts, countUsers, countCategories, lowStockProducts] = await Promise.all([
            AutoPart.countDocuments({}),
            User.countDocuments({}),
            Category.countDocuments({}),
            AutoPart.countDocuments({ stock: { $lte: 5 } }),
        ]);

        res.json({
            totalProducts: countProducts,
            totalUsers: countUsers,
            totalCategories: countCategories,
            lowStockProducts,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await AutoPart.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
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

            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();

            // Create Admin Notification
            try {
                const notification = await Notification.create({
                    type: 'review',
                    message: `Đánh giá mới cho ${product.name} từ ${req.user.name}`,
                    link: `/admin/reviews`,
                    referenceId: product._id
                });
                const io = req.app.get('io');
                if (io) io.emit('admin_new_notification', notification);
            } catch (err) {
                console.error('Notification error:', err);
            }

            res.status(201).json({ message: 'Review added' });

        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private
const updateProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await AutoPart.findById(req.params.id);

        if (product) {
            const review = product.reviews.id(req.params.reviewId);
            
            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }

            // Check ownership
            if (review.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to update this review' });
            }

            // Check admin response condition
            if (review.reply) {
                return res.status(400).json({ message: 'Cannot edit review after admin response' });
            }

            review.rating = Number(rating);
            review.comment = comment;

            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();
            res.json({ message: 'Review updated' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
const deleteProductReview = async (req, res) => {
    try {
        const product = await AutoPart.findById(req.params.id);

        if (product) {
            const review = product.reviews.id(req.params.reviewId);
            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }

            if (!req.user.isAdmin && review.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            product.reviews.pull(req.params.reviewId);
            product.numReviews = product.reviews.length;
            if (product.numReviews > 0) {
                product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
            } else {
                product.rating = 0;
            }

            await product.save();
            res.json({ message: 'Review deleted' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get related products / replacement parts
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res) => {
    try {
        const product = await AutoPart.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        const currentBrand = product.brand;
        const currentCategory = product.category;
        const compatBrands = (product.carCompatibilities || []).map(c => c.carBrand).filter(Boolean);

        const filter = {
            _id: { $ne: product._id }, // Exclude self
            isActive: true
        };

        const conditions = [];
        if (currentCategory) {
            conditions.push({ category: currentCategory });
        }
        if (currentBrand) {
            conditions.push({ brand: { $regex: new RegExp(`^${currentBrand}$`, 'i') } });
        }
        if (compatBrands.length > 0) {
            conditions.push({
                'carCompatibilities.carBrand': { $in: compatBrands }
            });
        }

        if (conditions.length > 0) {
            filter.$or = conditions;
        }

        const related = await AutoPart.find(filter)
            .populate('category', 'name slug')
            .limit(6);

        res.json(related);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getAdminStats,
    createProductReview,
    updateProductReview,
    deleteProductReview,
    decodeVinEndpoint,
    getCompatibilities,
    getRelatedProducts,
};
