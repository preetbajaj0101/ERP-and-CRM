const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const invoiceSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  transactionId: {
    type: String,
    required: true,
    ref: 'Transaction',
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    maxlength: 30,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  grandTotal: {
    type: Number,
    required: true,
  },
  pdfPath: {
    type: String,
    maxlength: 500,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'invoices',
});

module.exports = mongoose.model('Invoice', invoiceSchema);
