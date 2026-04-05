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
const path = require('path');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/parts', partRoutes);          // legacy route (unchanged)
app.use('/api/products', productRoutes);    // new product CRUD with pagination & category ref
app.use('/api/categories', categoryRoutes); // new category CRUD
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);

app.use(
    '/uploads',
    express.static(path.join(__dirname, '/uploads'))
);

app.get('/', (req, res) => {
    res.send('J2Car API is running...');
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
app.listen(PORT, () =>
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);
