require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.js');
const connectDB = require('./config/db.js');

connectDB();

const createAdmin = async () => {
    try {
        // Kiểm tra xem admin đã tồn tại chưa
        const existingAdmin = await User.findOne({ email: 'admin@j2car.com' });

        if (existingAdmin) {
            console.log('❌ Tài khoản admin đã tồn tại!');
            console.log(`   Email: ${existingAdmin.email}`);
            process.exit(0);
        }

        const admin = await User.create({
            name: 'Admin',
            email: 'admin@j2car.com',
            password: 'admin123456',
            isAdmin: true,
        });

        console.log('✅ Tạo tài khoản admin thành công!');
        console.log(`   Tên:      ${admin.name}`);
        console.log(`   Email:    ${admin.email}`);
        console.log(`   Mật khẩu: admin123456`);
        console.log(`   isAdmin:  ${admin.isAdmin}`);
        process.exit();
    } catch (error) {
        console.error(`❌ Lỗi: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
