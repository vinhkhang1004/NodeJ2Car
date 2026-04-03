const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryStats,
} = require('../controllers/categoryController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// Public routes
router.route('/').get(getCategories);
router.route('/:id').get(getCategoryById);

// Admin-only routes
router.route('/').post(protect, admin, createCategory);
router.route('/admin/stats').get(protect, admin, getCategoryStats);
router.route('/:id').put(protect, admin, updateCategory).delete(protect, admin, deleteCategory);

module.exports = router;
