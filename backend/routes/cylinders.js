const express = require('express');
const { Cylinder, GasType, Customer } = require('../models');
const authenticate = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, gasType, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (gasType) where.gasTypeId = gasType;
    if (search) {
      const { Op } = require('sequelize');
      where.serialNumber = { [Op.iLike]: `%${search}%` };
    }
    const cylinders = await Cylinder.findAll({
      where,
      include: [
        { model: GasType, as: 'gasType' },
        { model: Customer, as: 'currentHolder', attributes: ['id', 'name', 'phone'] },
      ],
      order: [['serialNumber', 'ASC']],
    });
    res.json({ success: true, data: cylinders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/summary', authenticate, async (req, res) => {
  try {
    const { fn, col } = require('sequelize');
    const counts = await Cylinder.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });
    const summary = { full: 0, empty: 0, in_refill: 0, with_customer: 0, damaged: 0, retired: 0 };
    counts.forEach(c => { summary[c.status] = parseInt(c.count); });
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authenticate, rbac('admin', 'purchaser'), async (req, res) => {
  try {
    const cylinder = await Cylinder.create(req.body);
    const result = await Cylinder.findByPk(cylinder.id, { include: [{ model: GasType, as: 'gasType' }] });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', authenticate, rbac('admin', 'purchaser'), async (req, res) => {
  try {
    const cylinder = await Cylinder.findByPk(req.params.id);
    if (!cylinder) return res.status(404).json({ success: false, message: 'Cylinder not found.' });
    await cylinder.update(req.body);
    res.json({ success: true, data: cylinder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/:id/assign', authenticate, rbac('admin', 'purchaser'), async (req, res) => {
  try {
    const { customerId } = req.body;
    const cylinder = await Cylinder.findByPk(req.params.id);
    if (!cylinder) return res.status(404).json({ success: false, message: 'Cylinder not found.' });
    await cylinder.update({ currentHolderId: customerId, status: 'with_customer' });
    res.json({ success: true, data: cylinder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/:id/return', authenticate, rbac('admin', 'purchaser'), async (req, res) => {
  try {
    const cylinder = await Cylinder.findByPk(req.params.id);
    if (!cylinder) return res.status(404).json({ success: false, message: 'Cylinder not found.' });
    await cylinder.update({ currentHolderId: null, status: 'empty' });
    res.json({ success: true, data: cylinder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
