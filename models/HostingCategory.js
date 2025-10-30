// models/HostingCategory.js
const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  setup_fee: Number,
  monthly: Number,
  quarterly: Number,
  semi_annually: Number,
  annually: Number,
  biennially: Number,
  triennially: Number
}, { _id: false });

const freeDomainSchema = new mongoose.Schema({
  available: Boolean,
  domains: [String]
}, { _id: false });

const planSchema = new mongoose.Schema({
  Name: String,
  product_description: String,
  pricing: pricingSchema,
  free_domain: freeDomainSchema,
  direct_shopping_link: String,
  currency: String
}, { _id: false });

const categorySchema = new mongoose.Schema({
  gid: { type: Number, unique: true, index: true },
  category: String,
  plans: [planSchema]
});

module.exports = mongoose.model('HostingCategory', categorySchema);