const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getAdminStats,
    createProductReview,
    updateProductReview,
    deleteProductReview,
} = require('../controllers/productController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// IMPORTANT: Specific routes MUST be declared before /:id to avoid conflicts
// Admin stats route
router.route('/admin/stats').get(protect, admin, getAdminStats);

// Public routes
router.route('/').get(getProducts).post(protect, admin, createProduct);

router.route('/:id/reviews')
    .post(protect, createProductReview);

router.route('/:id/reviews/:reviewId')
    .put(protect, updateProductReview)
    .delete(protect, deleteProductReview);

// Dynamic :id routes last
router.route('/:id')
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;
