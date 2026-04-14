const express = require('express');
const router = express.Router();
const { createMomoPayment, momoCallback } = require('../controllers/momoController');
const { createVnpayPayment, vnpayIPN } = require('../controllers/vnpayController');
const { protect } = require('../middleware/authMiddleware');

// MoMo Routes
router.post('/momo/:orderId', protect, createMomoPayment);
router.post('/momo/callback', momoCallback);

// VNPAY Routes
router.post('/vnpay/:orderId', protect, createVnpayPayment);
router.get('/vnpay/vnpay_ipn', vnpayIPN);

module.exports = router;
