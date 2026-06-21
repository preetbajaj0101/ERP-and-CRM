const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const cylinderSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50,
  },
  gasTypeId: {
    type: String,
    required: true,
    ref: 'GasType',
  },
  status: {
    type: String,
    enum: ['full', 'empty', 'in_refill', 'with_customer', 'damaged', 'retired'],
    default: 'empty',
  },
  currentHolderId: {
    type: String,
    ref: 'Customer',
    default: null,
    // Customer ID if currently with a customer
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large', 'jumbo'],
    default: 'medium',
  },
  purchaseCost: {
    type: Number,
  },
  depositAmount: {
    type: Number,
    default: 0,
    // Standard security deposit for this cylinder
  },
  lastRefillDate: {
    type: Date,
  },
  nextRefillDue: {
    type: Date,
  },
  testDueDate: {
    type: Date,
    // Hydrostatic test due date
  },
}, {
  timestamps: true,
  collection: 'cylinders',
});

module.exports = mongoose.model('Cylinder', cylinderSchema);
