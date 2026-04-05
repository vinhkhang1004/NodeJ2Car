const mongoose = require('mongoose');
const Category = require('./models/Category.js');

mongoose.connect('mongodb://127.0.0.1:27017/your_db_name')
  .then(async () => {
    const records = await Category.find();
    let count = 0;
    for (let p of records) {
      if (p.imageUrl && p.imageUrl.includes('/uploads/')) {
        p.imageUrl = '/uploads/' + p.imageUrl.split('/uploads/').pop();
        await p.save();
        count++;
      }
    }
    console.log(`Fixed ${count} categories.`);
    process.exit(0);
  })
  .catch(console.error);
