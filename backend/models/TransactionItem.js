const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const transactionItemSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  transactionId: {
    type: String,
    required: true,
    ref: 'Transaction',
  },
  inventoryId: {
    type: String,
    required: true,
    ref: 'Inventory',
  },
  cylinderId: {
    type: String,
    ref: 'Cylinder',
    // Linked cylinder serial for tracking
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
  collection: 'transaction_items',
});

module.exports = mongoose.model('TransactionItem', transactionItemSchema);
