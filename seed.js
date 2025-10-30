// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const HostingCategory = require('./models/HostingCategory');
const data = require('./data/hosting.json'); // your JSON file

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await HostingCategory.deleteMany({});
  await HostingCategory.insertMany(data.hosting_products);
  console.log('✅ MongoDB seeded with', data.hosting_products.length, 'categories');
  mongoose.disconnect();
}
seed().catch(console.error);