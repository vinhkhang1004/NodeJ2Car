require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.js');
const connectDB = require('./config/db.js');

const createAdmin = async () => {
    try {
        await connectDB();

        const adminExists = await User.findOne({ email: 'admin@example.com' });

        if (!adminExists) {
            await User.create({
                name: 'System Admin',
                email: 'admin@example.com',
                password: 'password123', // Will be hashed by pre-save middleware
                isAdmin: true
            });
            console.log('Admin user created (admin@example.com / password123)');
        } else {
            console.log('Admin user already exists');
        }
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
