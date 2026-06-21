const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const transactionSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  type: {
    type: String,
    enum: ['sale', 'purchase', 'refill', 'return', 'payment_received', 'payment_made'],
    required: true,
  },
  customerId: {
    type: String,
    ref: 'Customer',
  },
  vendorId: {
    type: String,
    ref: 'Vendor',
  },
  createdBy: {
    type: String,
    required: true,
    ref: 'User',
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  grandTotal: {
    type: Number,
    required: true,
    default: 0,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'partial', 'unpaid'],
    default: 'unpaid',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'credit', 'cheque'],
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
  collection: 'transactions',
});

module.exports = mongoose.model('Transaction', transactionSchema);
