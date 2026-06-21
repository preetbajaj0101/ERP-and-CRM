const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ledgerEntrySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  customerId: {
    type: String,
    ref: 'Customer',
  },
  vendorId: {
    type: String,
    ref: 'Vendor',
  },
  transactionId: {
    type: String,
    ref: 'Transaction',
  },
  entryType: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  runningBalance: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
    maxlength: 500,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'ledger_entries',
});

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);
