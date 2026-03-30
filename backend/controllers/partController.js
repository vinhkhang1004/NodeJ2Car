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

module.exports = {
    getParts,
    getPartById,
};
