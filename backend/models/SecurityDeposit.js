const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const securityDepositSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  customerId: {
    type: String,
    required: true,
    ref: 'Customer',
  },
  cylinderId: {
    type: String,
    required: true,
    ref: 'Cylinder',
  },
  depositAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'refunded', 'forfeited', 'adjusted'],
    default: 'active',
  },
  depositDate: {
    type: Date,
    required: true,
  },
  refundDate: {
    type: Date,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
  collection: 'security_deposits',
});

module.exports = mongoose.model('SecurityDeposit', securityDepositSchema);
