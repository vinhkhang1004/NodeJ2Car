const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Coupon = require('./models/Coupon');
const Category = require('./models/Category');

dotenv.config();

const seedCoupons = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding coupons...');

        // Clear existing coupons
        await Coupon.deleteMany();
        console.log('Cleared existing coupons.');

        // Get some categories to link (optional)
        const categories = await Category.find({});
        const interiorCat = categories.find(c => c.name.includes('Nội Thất'))?._id;
        const engineCat = categories.find(c => c.name.includes('Động Cơ'))?._id;

        const coupons = [
            {
                code: 'J2CAR10',
                discountType: 'Percentage',
                discountAmount: 10,
                minPurchase: 0,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                usageLimit: 500,
                isActive: true,
                applicableCategories: []
            },
            {
                code: 'HOTDEAL50',
                discountType: 'FixedAmount',
                discountAmount: 50000,
                minPurchase: 300000,
                expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
                usageLimit: 100,
                isActive: true,
                applicableCategories: []
            },
            {
                code: 'SUPER20',
                discountType: 'Percentage',
                discountAmount: 20,
                minPurchase: 1000000,
                expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                usageLimit: 50,
                isActive: true,
                applicableCategories: []
            },
            {
                code: 'WELCOME',
                discountType: 'FixedAmount',
                discountAmount: 20000,
                minPurchase: 100000,
                expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
                usageLimit: 1000,
                isActive: true,
                applicableCategories: []
            }
        ];

        // Add category specific if found
        if (interiorCat) {
            coupons.push({
                code: 'NOITHAT15',
                discountType: 'Percentage',
                discountAmount: 15,
                minPurchase: 500000,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                usageLimit: 100,
                isActive: true,
                applicableCategories: [interiorCat]
            });
        }

        if (engineCat) {
            coupons.push({
                code: 'DONGCO100',
                discountType: 'FixedAmount',
                discountAmount: 100000,
                minPurchase: 2000000,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                usageLimit: 30,
                isActive: true,
                applicableCategories: [engineCat]
            });
        }

        await Coupon.insertMany(coupons);
        console.log('Seeded coupons successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding coupons:', error);
        process.exit(1);
    }
};

seedCoupons();
