const mongoose = require('mongoose');
const AutoPart = require('./models/AutoPart');
const Category = require('./models/Category');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/your_db_name';

const cleanPath = (oldPath) => {
  if (!oldPath) return '';
  if (oldPath.startsWith('http')) return oldPath;

  // Find the filename. Usually it follows 'uploads/' or 'uploads\'
  // We look for 'uploads' and take everything after the next slash/backslash
  const match = oldPath.match(/uploads[\\\/](.+)$/i);
  if (match && match[1]) {
    const filename = match[1].replace(/\\/g, '/').split('/').pop();
    return `/uploads/${filename}`;
  }

  // If no 'uploads' found, maybe it's just a filename
  const filename = oldPath.replace(/\\/g, '/').split('/').pop();
  return `/uploads/${filename}`;
};

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB for cleanup...');

    // Clean Products
    const products = await AutoPart.find({});
    let pCount = 0;
    for (const p of products) {
      const newPath = cleanPath(p.imageUrl);
      if (newPath !== p.imageUrl) {
        p.imageUrl = newPath;
        await p.save();
        pCount++;
      }
    }
    console.log(`Updated ${pCount} products.`);

    // Clean Categories
    const categories = await Category.find({});
    let cCount = 0;
    for (const c of categories) {
      const newPath = cleanPath(c.imageUrl);
      if (newPath !== c.imageUrl) {
        c.imageUrl = newPath;
        await c.save();
        cCount++;
      }
    }
    console.log(`Updated ${cCount} categories.`);

    mongoose.connection.close();
    console.log('Cleanup finished.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Cleanup failed:', err);
    process.exit(1);
  });
