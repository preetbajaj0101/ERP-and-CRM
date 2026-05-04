const express = require('express');
const { Inventory, GasType } = require('../models');
const authenticate = require('../middleware/auth');
const rbac = require('../middleware/rbac');

const router = express.Router();

// ─── Get All Inventory ────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, search, lowStock } = req.query;
    const where = {};
    if (type) where.itemType = type;

    if (search) {
      const { Op } = require('sequelize');
      where.itemName = { [Op.iLike]: `%${search}%` };
    }

    const items = await Inventory.findAll({
      where,
      include: [{ model: GasType, as: 'gasType' }],
      order: [['itemName', 'ASC']],
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
    const items = await Inventory.findAll({
      include: [{ model: GasType, as: 'gasType' }],
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
    const item = await Inventory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    await item.update(req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─── Delete Inventory Item ────────────────────────────────
router.delete('/:id', authenticate, rbac('admin'), async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    await item.destroy();
    res.json({ success: true, message: 'Item deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
