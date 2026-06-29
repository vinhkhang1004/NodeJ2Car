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
    decodeVinEndpoint,
    getCompatibilities,
    getRelatedProducts,
} = require('../controllers/productController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// IMPORTANT: Specific routes MUST be declared before /:id to avoid conflicts
// Admin stats route
router.route('/admin/stats').get(protect, admin, getAdminStats);

// Compatibility lookup for filtering
router.route('/compatibilities').get(getCompatibilities);

// VIN Decoding lookup
router.route('/decode-vin/:vin').get(decodeVinEndpoint);

// Related products
router.route('/:id/related').get(getRelatedProducts);

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
