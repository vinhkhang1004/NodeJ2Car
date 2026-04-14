require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');

const authRoutes = require('./routes/authRoutes.js');
const partRoutes = require('./routes/partRoutes.js');       // legacy — keep for backward compat
const productRoutes = require('./routes/productRoutes.js'); // new full-featured
const categoryRoutes = require('./routes/categoryRoutes.js');
const uploadRoutes = require('./routes/uploadRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes.js');
const couponRoutes = require('./routes/couponRoutes.js');
const path = require('path');



const http = require('http');
const { Server } = require('socket.io');
const chatRoutes = require('./routes/chatRoutes.js');
const Message = require('./models/Message.js');
const Notification = require('./models/Notification.js');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {

    cors: {
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'https://j2autoparts.web.app',
            'https://j2autoparts.firebaseapp.com'
        ],
    }
});

app.set('io', io);


// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://j2autoparts.web.app',
    'https://j2autoparts.firebaseapp.com'
  ],
  credentials: true
}));
app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Mount Routes

app.use('/api/auth', authRoutes);
app.use('/api/parts', partRoutes);          // legacy route (unchanged)
app.use('/api/products', productRoutes);    // new product CRUD with pagination & category ref
app.use('/api/categories', categoryRoutes); // new category CRUD
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/coupons', couponRoutes);



app.use(
    '/uploads',
    express.static(path.join(__dirname, '/uploads'))
);

app.get('/', (req, res) => {
    res.send('J2Car API is running...');
});

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    socket.on('send_message', async (data) => {
        const { sender, guestId, senderName, message, isAdmin, roomId } = data;
        
        try {
            // Save to DB
            const newMessage = await Message.create({
                sender: sender || null,
                guestId: guestId || null,
                senderName,
                message,
                isAdmin: isAdmin || false,
            });

            // Emit to room
            io.to(roomId).emit('receive_message', newMessage);

            // If not admin, notify all admins of new message
            if (!isAdmin) {
                // Save to central notification system
                try {
                    await Notification.create({
                        type: 'chat',
                        message: `Tin nhắn mới từ ${senderName}`,
                        link: '/admin/chat',
                        referenceId: roomId
                    });
                } catch (err) {
                    console.error('Chat notification save error:', err);
                }

                io.emit('admin_notification', {
                    roomId,
                    senderName,
                    message: newMessage
                });
            }

        } catch (error) {
            console.error('Socket error:', error);
        }
    });

    socket.on('mark_seen', async (data) => {
        const { roomId, isAdmin } = data;
        try {
            await Message.updateMany(
                { 
                    $or: [{ sender: roomId }, { guestId: roomId }, { receiver: roomId }],
                    isRead: false,
                    isAdmin: !isAdmin // If user opening, mark admin messages seen. If admin, mark user's.
                },
                { isRead: true, status: 'seen' }
            );
            io.to(roomId).emit('messages_seen', { roomId });
        } catch (error) {
            console.error('Mark seen error:', error);
        }
    });

    socket.on('toggle_support_status', (isOnline) => {
        io.emit('support_status_change', isOnline);
    });

    socket.on('disconnect', () => {

        console.log('User disconnected:', socket.id);
    });
});

// Generic Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

