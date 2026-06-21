const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const customerSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  name: {
    type: String,
    required: true,
    maxlength: 150,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    maxlength: 20,
  },
  email: {
    type: String,
    maxlength: 255,
  },
  address: {
    type: String,
  },
  gstNumber: {
    type: String,
    maxlength: 20,
  },
  notes: {
    type: String,
  },
  creditLimit: {
    type: Number,
    default: 0,
  },
  currentBalance: {
    type: Number,
    default: 0,
    // Positive = customer owes us, Negative = we owe customer
  },
}, {
  timestamps: true,
  collection: 'customers',
});

module.exports = mongoose.model('Customer', customerSchema);
