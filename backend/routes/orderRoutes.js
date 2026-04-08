const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    getDashboardStats,
    exportOrders,
    exportRevenue
} = require('../controllers/orderController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// @route   GET /api/orders/dashboard
router.route('/dashboard').get(protect, admin, getDashboardStats);

// @route   GET /api/orders
// @route   POST /api/orders
router.route('/')
    .post(protect, addOrderItems)
    .get(protect, admin, getOrders);

// @route   GET /api/orders/myorders
router.route('/myorders').get(protect, getMyOrders);

// @route   GET /api/orders/:id
router.route('/:id').get(protect, getOrderById);

// @route   PUT /api/orders/:id/pay
router.route('/:id/pay').put(protect, updateOrderToPaid);

// @route   PUT /api/orders/:id/deliver
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

// @route   PUT /api/orders/:id/status
router.route('/:id/status').put(protect, admin, updateOrderStatus);

router.get('/export/orders', protect, admin, exportOrders);
router.get('/export/revenue', protect, admin, exportRevenue);

module.exports = router;
