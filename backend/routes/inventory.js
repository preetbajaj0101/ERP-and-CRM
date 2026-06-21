const express = require('express');
const { Inventory, GasType } = require('../models');
const authenticate = require('../middleware/auth');
const rbac = require('../middleware/rbac');

const router = express.Router();

// ─── Get All Inventory ────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, search, lowStock } = req.query;
    const query = {};
    if (type) query.itemType = type;

    if (search) {
      query.itemName = { $regex: search, $options: 'i' };
    }

    let items = await Inventory.find(query)
      .populate('gasTypeId')
      .sort({ itemName: 1 });

    // Transform populated gasTypeId to gasType for frontend compatibility
    items = items.map(item => {
      const obj = item.toObject();
      obj.gasType = obj.gasTypeId;
      return obj;
    });

    let result = items;
    if (lowStock === 'true') {
      result = items.filter(item => {
        if (item.itemType === 'gas_cylinder') {
          return item.quantityFull <= item.reorderLevel;
        }
        return item.quantityTotal <= item.reorderLevel;
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Get Inventory Summary (for dashboard) ────────────────
router.get('/summary', authenticate, async (req, res) => {
  try {
    let items = await Inventory.find().populate('gasTypeId');
    items = items.map(item => {
      const obj = item.toObject();
      obj.gasType = obj.gasTypeId;
      return obj;
    });

    const summary = {
      totalItems: items.length,
      totalFullCylinders: items.filter(i => i.itemType === 'gas_cylinder').reduce((sum, i) => sum + i.quantityFull, 0),
      totalEmptyCylinders: items.filter(i => i.itemType === 'gas_cylinder').reduce((sum, i) => sum + i.quantityEmpty, 0),
      lowStockItems: items.filter(i => {
        if (i.itemType === 'gas_cylinder') return i.quantityFull <= i.reorderLevel;
        return i.quantityTotal <= i.reorderLevel;
      }).length,
      byGasType: {},
    };

    items.filter(i => i.itemType === 'gas_cylinder' && i.gasType).forEach(item => {
      summary.byGasType[item.gasType.name] = {
        full: item.quantityFull,
        empty: item.quantityEmpty,
        color: item.gasType.color,
      };
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Create Inventory Item ────────────────────────────────
router.post('/', authenticate, rbac('admin', 'purchaser'), async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─── Update Inventory Item ────────────────────────────────
router.put('/:id', authenticate, rbac('admin', 'purchaser'), async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─── Delete Inventory Item ────────────────────────────────
router.delete('/:id', authenticate, rbac('admin'), async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, message: 'Item deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
