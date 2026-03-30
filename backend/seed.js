require('dotenv').config();
const mongoose = require('mongoose');
const parts = require('./data/parts.js');
const AutoPart = require('./models/AutoPart.js');
const User = require('./models/User.js');
const connectDB = require('./config/db.js');

connectDB();

const importData = async () => {
    try {
        await AutoPart.deleteMany();
        await User.deleteMany();

        await AutoPart.insertMany(parts);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await AutoPart.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
