const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const gasTypeSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50,
  },
  formula: {
    type: String,
    maxlength: 10,
    // Chemical formula e.g. O2, CO2, Ar
  },
  unit: {
    type: String,
    enum: ['kg', 'litre', 'cubic_m', 'cylinder'],
    default: 'cylinder',
  },
  basePrice: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    maxlength: 7,
    // Hex color for UI display
  },
}, {
  timestamps: true,
  collection: 'gas_types',
});

module.exports = mongoose.model('GasType', gasTypeSchema);
