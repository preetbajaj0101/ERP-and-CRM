const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const vendorSchema = new mongoose.Schema({
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
  currentBalance: {
    type: Number,
    default: 0,
    // Positive = we owe vendor, Negative = vendor owes us
  },
}, {
  timestamps: true,
  collection: 'vendors',
});

module.exports = mongoose.model('Vendor', vendorSchema);
