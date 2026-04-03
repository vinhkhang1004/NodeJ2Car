const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getAdminStats,
} = require('../controllers/productController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// Public routes
router.route('/').get(getProducts);
router.route('/:id').get(getProductById);

// Admin routes — must define /admin/stats BEFORE /:id to avoid conflicts
router.route('/admin/stats').get(protect, admin, getAdminStats);
router.route('/').post(protect, admin, createProduct);
router.route('/:id').put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);

module.exports = router;
