const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/Order');

/**
 * @desc    Create MoMo payment URL
 * @route   POST /api/payment/momo/:orderId
 * @access  Private
 */
const createMomoPayment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const partnerCode = process.env.MOMO_PARTNER_CODE;
        const accessKey = process.env.MOMO_ACCESS_KEY;
        const secretKey = process.env.MOMO_SECRET_KEY;
        const endpoint = process.env.MOMO_ENDPOINT;

        const requestId = partnerCode + new Date().getTime();
        const orderId = order._id.toString();
        const orderInfo = `Thanh toán đơn hàng #${orderId} tại J2Car`;
        const redirectUrl = `${process.env.FRONTEND_URL}/order-success/${orderId}`;
        const ipnUrl = `${process.env.BACKEND_URL}/api/payment/momo/callback`;
        const amount = order.totalPrice.toString();
        const requestType = "captureWallet";
        const extraData = ""; // optional

        // Construct raw signature string
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        const requestBody = {
            partnerCode,
            partnerName: "J2Car",
            storeId: "J2CarStore",
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            lang: "vi",
            requestType,
            autoCapture: true,
            extraData,
            signature
        };

        const response = await axios.post(endpoint, requestBody);

        if (response.data && response.data.resultCode === 0) {
            res.json({ payUrl: response.data.shortLink || response.data.payUrl });
        } else {
            console.error('MoMo Error:', response.data);
            res.status(400).json({ message: response.data.message || 'Error creating MoMo payment' });
        }
    } catch (error) {
        console.error('MoMo Exception:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Handle MoMo IPN Callback
 * @route   POST /api/payment/momo/callback
 * @access  Public
 */
const momoCallback = async (req, res) => {
    try {
        const {
            partnerCode, orderId, requestId, amount, orderInfo,
            orderType, transId, resultCode, message, payType,
            responseTime, extraData, signature
        } = req.body;

        // Verify signature
        const secretKey = process.env.MOMO_SECRET_KEY;
        const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
        
        const checkSignature = crypto
            .createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        if (checkSignature !== signature) {
            return res.status(400).json({ message: 'Invalid signature' });
        }

        if (resultCode === 0) {
            const order = await Order.findById(orderId);
            if (order) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: transId.toString(),
                    status: 'Paid via MoMo',
                    update_time: responseTime.toString(),
                    email_address: order.shippingAddress.email
                };
                await order.save();
                console.log(`Order ${orderId} marked as PAID via MoMo`);
            }
        }

        res.status(204).send();
    } catch (error) {
        console.error('MoMo Callback Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createMomoPayment,
    momoCallback
};
