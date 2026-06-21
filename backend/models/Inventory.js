const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const inventorySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  gasTypeId: {
    type: String,
    ref: 'GasType',
  },
  itemName: {
    type: String,
    required: true,
    maxlength: 200,
  },
  itemType: {
    type: String,
    enum: ['gas_cylinder', 'welding_accessory', 'equipment', 'consumable'],
    required: true,
  },
  sku: {
    type: String,
    maxlength: 50,
    sparse: true,
    unique: true,
  },
  quantityFull: {
    type: Number,
    default: 0,
    // Full/ready stock count
  },
  quantityEmpty: {
    type: Number,
    default: 0,
    // Empty cylinders awaiting refill
  },
  quantityTotal: {
    type: Number,
    default: 0,
    // For non-cylinder items, total stock
  },
  reorderLevel: {
    type: Number,
    default: 5,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  costPrice: {
    type: Number,
  },
}, {
  timestamps: true,
  collection: 'inventory',
});

module.exports = mongoose.model('Inventory', inventorySchema);
