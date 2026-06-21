const express = require('express');
const { Cylinder, GasType, Customer } = require('../models');
const authenticate = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, gasType, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (gasType) query.gasTypeId = gasType;
    if (search) query.serialNumber = { $regex: search, $options: 'i' };

    let cylinders = await Cylinder.find(query)
      .populate('gasTypeId')
      .populate('currentHolderId', 'name phone')
      .sort({ serialNumber: 1 });

    cylinders = cylinders.map(c => {
      const obj = c.toObject();
      obj.gasType = obj.gasTypeId;
      obj.currentHolder = obj.currentHolderId;
      return obj;
    });

    res.json({ success: true, data: cylinders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/summary', authenticate, async (req, res) => {
  try {
    const counts = await Cylinder.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const summary = { full: 0, empty: 0, in_refill: 0, with_customer: 0, damaged: 0, retired: 0 };
    counts.forEach(c => { summary[c._id] = c.count; });
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authenticate, rbac('admin', 'purchaser'), async (req, res) => {
  try {
    const cylinder = await Cylinder.create(req.body);
    const result = await Cylinder.findById(cylinder._id).populate('gasTypeId');
    const obj = result.toObject();
    obj.gasType = obj.gasTypeId;
    res.status(201).json({ success: true, data: obj });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', authenticate, rbac('admin', 'purchaser'), async (req, res) => {
  try {
    const cylinder = await Cylinder.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cylinder) return res.status(404).json({ success: false, message: 'Cylinder not found.' });
    res.json({ success: true, data: cylinder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/:id/assign', authenticate, rbac('admin', 'purchaser'), async (req, res) => {
  try {
    const { customerId } = req.body;
    const cylinder = await Cylinder.findByIdAndUpdate(req.params.id, { currentHolderId: customerId, status: 'with_customer' }, { new: true });
    if (!cylinder) return res.status(404).json({ success: false, message: 'Cylinder not found.' });
    res.json({ success: true, data: cylinder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/:id/return', authenticate, rbac('admin', 'purchaser'), async (req, res) => {
  try {
    const cylinder = await Cylinder.findByIdAndUpdate(req.params.id, { currentHolderId: null, status: 'empty' }, { new: true });
    if (!cylinder) return res.status(404).json({ success: false, message: 'Cylinder not found.' });
    res.json({ success: true, data: cylinder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
