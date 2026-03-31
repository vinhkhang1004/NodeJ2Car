const Category = require('../models/Category.js');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const { active } = req.query;
        const filter = {};
        if (active === 'true') filter.isActive = true;

        const categories = await Category.find(filter)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single category by id or slug
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const isObjectId = /^[a-fA-F0-9]{24}$/.test(id);

        const category = isObjectId
            ? await Category.findById(id).populate('createdBy', 'name email')
            : await Category.findOne({ slug: id }).populate('createdBy', 'name email');

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    try {
        const { name, description, imageUrl, isActive } = req.body;

        const exists = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
        if (exists) {
            return res.status(400).json({ message: 'Category with this name already exists' });
        }

        // Generate slug
        const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

        const category = new Category({
            name,
            slug,
            description: description || '',
            imageUrl: imageUrl || '',
            isActive: isActive !== undefined ? isActive : true,
            createdBy: req.user._id,
        });

        const created = await category.save();
        await created.populate('createdBy', 'name email');
        res.status(201).json(created);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const { name, description, imageUrl, isActive } = req.body;

        // Check duplicate name (exclude self)
        if (name && name !== category.name) {
            const exists = await Category.findOne({
                name: { $regex: `^${name}$`, $options: 'i' },
                _id: { $ne: category._id },
            });
            if (exists) {
                return res.status(400).json({ message: 'Category with this name already exists' });
            }
            category.name = name;
            category.slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        }

        if (description !== undefined) category.description = description;
        if (imageUrl !== undefined) category.imageUrl = imageUrl;
        if (isActive !== undefined) category.isActive = isActive;

        const updated = await category.save();
        await updated.populate('createdBy', 'name email');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if any product uses this category
        const AutoPart = require('../models/AutoPart.js');
        const count = await AutoPart.countDocuments({ category: req.params.id });
        if (count > 0) {
            return res.status(400).json({
                message: `Cannot delete: ${count} product(s) are using this category. Reassign them first.`,
            });
        }

        await Category.deleteOne({ _id: category._id });
        res.json({ message: 'Category removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get category stats
// @route   GET /api/categories/stats
// @access  Private/Admin
const getCategoryStats = async (req, res) => {
    try {
        const AutoPart = require('../models/AutoPart.js');
        const [totalCategories, activeCategories, categoryCounts] = await Promise.all([
            Category.countDocuments({}),
            Category.countDocuments({ isActive: true }),
            AutoPart.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
                { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
                { $project: { name: '$category.name', count: 1 } },
                { $sort: { count: -1 } },
            ]),
        ]);

        res.json({ totalCategories, activeCategories, categoryCounts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryStats,
};
