const AutoPart = require('../models/AutoPart.js');

// @desc    Fetch all auto parts with optional search
// @route   GET /api/parts
// @access  Public
const getParts = async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? {
                  name: {
                      $regex: req.query.keyword,
                      $options: 'i',
                  },
              }
            : {};

        const parts = await AutoPart.find({ ...keyword });
        res.json(parts);
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

module.exports = {
    getParts,
    getPartById,
    createPart,
    updatePart,
    deletePart,
    getAdminStats,
};
