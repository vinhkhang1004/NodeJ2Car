const AutoPart = require('../models/AutoPart.js');

// @desc    Fetch all auto parts with optional search, filter, pagination
// @route   GET /api/products
// @access  Public
// ..
const getProducts = async (req, res) => {
    try {
        const { keyword, category, brand, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

        const filter = {};

        if (keyword) {
            filter.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { brand: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
            ];
        }
        if (category) filter.category = category;
        if (brand) filter.brand = { $regex: brand, $options: 'i' };
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
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
        const { name, category, price, description, stock, imageUrl, brand, sku, isActive } = req.body;

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

        const { name, category, price, description, stock, imageUrl, brand, sku, isActive } = req.body;

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

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getAdminStats,
};
