const mongoose = require('mongoose');
const { mongoURI } = require('../config/database');

// ─── Models ───────────────────────────────────────────────
const User = require('./User');
const Customer = require('./Customer');
const Vendor = require('./Vendor');
const GasType = require('./GasType');
const Cylinder = require('./Cylinder');
const Inventory = require('./Inventory');
const Transaction = require('./Transaction');
const TransactionItem = require('./TransactionItem');
const LedgerEntry = require('./LedgerEntry');
const SecurityDeposit = require('./SecurityDeposit');
const Invoice = require('./Invoice');
const DamageReport = require('./DamageReport');

// ─── Connect to MongoDB ──────────────────────────────────
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = {
  mongoose,
  connectDB,
  User,
  Customer,
  Vendor,
  GasType,
  Cylinder,
  Inventory,
  Transaction,
  TransactionItem,
  LedgerEntry,
  SecurityDeposit,
  Invoice,
  DamageReport,
};
