const Order = require('../models/Order.js');
const AutoPart = require('../models/AutoPart.js');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        const order = new Order({
            orderItems: orderItems.map((x) => ({
                ...x,
                product: x.product || x._id,
                _id: undefined,
            })),
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

        const createdOrder = await order.save();

        // Update stock
        for (const item of orderItems) {
            const product = await AutoPart.findById(item.product || item._id);
            if (product) {
                product.stock -= item.qty;
                await product.save();
            }
        }

        res.status(201).json(createdOrder);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('orderItems.product', 'name sku price imageUrl');

    if (order) {
        // Only allow user who placed the order or admin to view it
        if (order.user._id.toString() === req.user._id.toString() || req.user.isAdmin) {
            res.json(order);
        } else {
            res.status(403);
            throw new Error('Not authorized to view this order');
        }
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.status = 'Delivered';

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    const orders = await Order.find({})
        .populate('user', 'id name')
        .sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = req.body.status || order.status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Get admin dashboard stats (orders + revenue)
// @route   GET /api/orders/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const [
            totalOrders,
            thisMonthOrders,
            lastMonthOrders,
            revenueResult,
            thisMonthRevenue,
            lastMonthRevenue,
            statusCounts,
            recentOrders,
            revenueByDay,
        ] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
            Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
            Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
            Order.aggregate([
                { $match: { createdAt: { $gte: startOfThisMonth } } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]),
            Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Order.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        revenue: { $sum: '$totalPrice' },
                        orders: { $sum: 1 },
                    }
                },
                { $sort: { _id: 1 } }
            ]),
        ]);

        const totalRevenue = revenueResult[0]?.total || 0;
        const thisMonthRev = thisMonthRevenue[0]?.total || 0;
        const lastMonthRev = lastMonthRevenue[0]?.total || 0;

        res.json({
            totalOrders,
            thisMonthOrders,
            lastMonthOrders,
            totalRevenue,
            thisMonthRevenue: thisMonthRev,
            lastMonthRevenue: lastMonthRev,
            statusCounts,
            recentOrders,
            revenueByDay,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    getDashboardStats,
};
