const Order = require('../models/Order.js');
const AutoPart = require('../models/AutoPart.js');
const Notification = require('../models/Notification.js');
const sendEmail = require('../utils/sendEmail.js');

const { generateExcel } = require('../utils/excel.js');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
// ..
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
            shippingAddress: {
                ...shippingAddress,
                country: shippingAddress.country || 'Việt Nam',
            },

            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

        const createdOrder = await order.save();

        // Create Admin Notification
        try {
            const notification = await Notification.create({
                type: 'order',
                message: `Đơn hàng mới #${createdOrder._id} từ ${req.user.name}`,
                link: `/admin/orders`,
                referenceId: createdOrder._id
            });
            const io = req.app.get('io');
            if (io) io.emit('admin_new_notification', notification);
        } catch (err) {
            console.error('Notification error:', err);
        }

        // Update stock

        for (const item of orderItems) {
            await AutoPart.updateOne(
                { _id: item.product || item._id },
                { $inc: { stock: -item.qty } }
            );
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
        const oldStatus = order.status;
        order.status = req.body.status || order.status;
        const updatedOrder = await order.save();

        // Send email if status changed
        if (oldStatus !== updatedOrder.status) {
            const recipientEmail = updatedOrder.shippingAddress.email;
            const recipientName = updatedOrder.shippingAddress.name;
            const statusLabels = {
                'Processing': 'Đang xử lý',
                'Shipped': 'Đang vận chuyển',
                'Delivered': 'Đã giao hàng',
                'Cancelled': 'Đã hủy'
            };

            await sendEmail({
                email: recipientEmail,
                subject: `Cập nhật trạng thái đơn hàng #${updatedOrder._id}`,
                message: `Xin chào ${recipientName}, trạng thái đơn hàng #${updatedOrder._id} của bạn đã được cập nhật thành: ${statusLabels[updatedOrder.status] || updatedOrder.status}.`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 12px; border: 1px solid #e2e8f0;">
                            <h2 style="color: #0f172a; margin-bottom: 24px;">Thông báo cập nhật đơn hàng</h2>
                            <p>Xin chào <strong>${recipientName}</strong>,</p>
                            <p>Chúng tôi xin thông báo trạng thái đơn hàng <strong>#${updatedOrder._id}</strong> của bạn đã thay đổi:</p>
                            <div style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; border-radius: 8px; font-weight: bold; margin: 20px 0;">
                                ${statusLabels[updatedOrder.status] || updatedOrder.status}
                            </div>
                            <p>Cảm ơn bạn đã tin tưởng và lựa chọn J2AutoParts.</p>
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                            <p style="font-size: 12px; color: #64748b;">Đây là email tự động, vui lòng không trả lời email này.</p>
                        </div>
                    </div>
                `
            });
        }

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

// Xuất danh sách hóa đơn (Orders)
const exportOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('orderItems.product', 'name sku')
      .sort({ createdAt: -1 });

    // Chuẩn bị dữ liệu cho Excel
    const excelData = orders.map(order => ({
      'Mã đơn': order._id,
      'Khách hàng': order.user?.name || 'N/A',
      'Email': order.user?.email || 'N/A',
      'Tổng tiền': order.totalPrice,
      'Trạng thái': order.orderStatus,
      'Ngày tạo': order.createdAt.toLocaleDateString('vi-VN'),
      'Sản phẩm': order.orderItems.map(item => `${item.product?.name} (x${item.qty})`).join(', ')
    }));

    const { buffer, fileName } = generateExcel(excelData, 'Hóa đơn', 'orders.xlsx');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xuất doanh thu (Revenue)
const exportRevenue = async (req, res) => {
  try {
    // Tính doanh thu theo tháng (ví dụ: tổng doanh thu từ orders đã giao)
    const revenueData = await Order.aggregate([
      { $match: { orderStatus: 'Delivered' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalRevenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id': -1 } }
    ]);

    // Chuẩn bị dữ liệu cho Excel
    const excelData = revenueData.map(item => ({
      'Tháng': item._id,
      'Tổng doanh thu': item.totalRevenue,
      'Số đơn hàng': item.orderCount
    }));

    const { buffer, fileName } = generateExcel(excelData, 'Doanh thu', 'revenue.xlsx');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(buffer);
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
    exportOrders,
    exportRevenue,
};
