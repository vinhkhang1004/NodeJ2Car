const { VNPay, HashAlgorithm } = require('vnpay');
const Order = require('../models/Order');

/**
 * @desc    Create VNPAY payment URL
 * @route   POST /api/payment/vnpay/:orderId
 * @access  Private
 */
const createVnpayPayment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const vnpay = new VNPay({
            tmnCode: process.env.VNP_TMN_CODE,
            secureSecret: process.env.VNP_HASH_SECRET,
            vnpayHost: 'https://sandbox.vnpayment.vn',
            testMode: true,
            hashAlgorithm: HashAlgorithm.SHA512,
        });

        const paymentUrl = vnpay.buildPaymentUrl({
            vnp_Amount: order.totalPrice,
            vnp_IpAddr: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1',
            vnp_TxnRef: order._id.toString(),
            vnp_OrderInfo: `Thanh toan don hang #${order._id}`,
            vnp_OrderType: 'other',
            vnp_ReturnUrl: `${process.env.FRONTEND_URL}/order-success/${order._id}`,
            vnp_Locale: 'vn',
        });

        res.json({ payUrl: paymentUrl });
    } catch (error) {
        console.error('VNPAY Exception:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Handle VNPAY IPN Callback
 * @route   GET /api/payment/vnpay/vnpay_ipn
 * @access  Public
 */
const vnpayIPN = async (req, res) => {
    try {
        const vnpay = new VNPay({
            tmnCode: process.env.VNP_TMN_CODE,
            secureSecret: process.env.VNP_HASH_SECRET,
            vnpayHost: 'https://sandbox.vnpayment.vn',
            testMode: true,
            hashAlgorithm: HashAlgorithm.SHA512,
        });

        const verify = vnpay.verifyIpnCall(req.query);

        if (verify.isSuccess) {
            const orderId = verify.vnp_TxnRef;
            const amount = verify.vnp_Amount;
            const responseCode = verify.vnp_ResponseCode;

            // responseCode === '00' means success
            if (responseCode === '00') {
                const order = await Order.findById(orderId);
                if (order) {
                    order.isPaid = true;
                    order.paidAt = Date.now();
                    order.paymentResult = {
                        id: verify.vnp_TransactionNo,
                        status: 'Paid via VNPAY',
                        update_time: verify.vnp_PayDate,
                        email_address: order.shippingAddress.email
                    };
                    await order.save();
                    console.log(`Order ${orderId} marked as PAID via VNPAY`);
                }
            }
            
            // Return success to VNPAY
            res.status(200).json({ RspCode: '00', Message: 'Success' });
        } else {
            console.warn('VNPAY IPN Signature Verification Failed');
            res.status(200).json({ RspCode: '97', Message: 'Invalid Checksum' });
        }
    } catch (error) {
        console.error('VNPAY IPN Error:', error);
        res.status(500).json({ RspCode: '99', Message: 'Unknown Error' });
    }
};

module.exports = {
    createVnpayPayment,
    vnpayIPN
};
