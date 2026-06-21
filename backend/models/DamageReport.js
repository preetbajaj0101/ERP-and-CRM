const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const damageReportSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  reportNumber: {
    type: String,
    required: true,
    unique: true,
    maxlength: 30,
    // Auto-generated damage report number e.g. DMG-2026-0001
  },
  itemCategory: {
    type: String,
    enum: ['cylinder', 'welding_torch', 'gas_regulator', 'welding_rod', 'hose_pipe', 'nozzle', 'other_equipment'],
    required: true,
  },
  itemDescription: {
    type: String,
    required: true,
    maxlength: 300,
    // Description of the damaged item
  },
  cylinderId: {
    type: String,
    ref: 'Cylinder',
    // Reference to cylinder if category is cylinder
  },
  inventoryId: {
    type: String,
    ref: 'Inventory',
    // Reference to inventory item if applicable
  },
  customerId: {
    type: String,
    ref: 'Customer',
    // Customer who had the item when damaged
  },
  damageType: {
    type: String,
    enum: ['dent', 'leak', 'valve_damage', 'corrosion', 'crack', 'thread_damage', 'burn_damage', 'electrical_fault', 'other'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['minor', 'moderate', 'severe', 'total_loss'],
    default: 'moderate',
  },
  damageDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  reportedBy: {
    type: String,
    ref: 'User',
    // User who reported the damage
  },
  damageDescription: {
    type: String,
    // Detailed notes about the damage
  },
  estimatedLoss: {
    type: Number,
    // Estimated financial loss in rupees
  },
  repairCost: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['reported', 'under_review', 'repairable', 'written_off', 'repaired', 'resolved'],
    default: 'reported',
  },
  resolution: {
    type: String,
    // How the damage was resolved
  },
  resolvedAt: {
    type: Date,
  },
  chargeToCustomer: {
    type: Boolean,
    default: false,
    // Whether damage cost should be charged to customer
  },
  chargedAmount: {
    type: Number,
  },
}, {
  timestamps: true,
  collection: 'damage_reports',
});

module.exports = mongoose.model('DamageReport', damageReportSchema);
