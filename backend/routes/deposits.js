const express = require('express');
const { SecurityDeposit, Customer, Cylinder, GasType } = require('../models');
const authenticate = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, customerId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (customerId) query.customerId = customerId;

    let deposits = await SecurityDeposit.find(query)
      .populate('customerId', 'name phone')
      .populate({
        path: 'cylinderId',
        select: 'serialNumber gasTypeId',
        populate: { path: 'gasTypeId', select: 'name' },
      })
      .sort({ depositDate: -1 });

    // Map for frontend compatibility
    deposits = deposits.map(d => {
      const obj = d.toObject();
      obj.customer = obj.customerId;
      if (obj.cylinderId) {
        obj.cylinder = { ...obj.cylinderId, gasType: obj.cylinderId.gasTypeId };
      }
      return obj;
    });

    res.json({ success: true, data: deposits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authenticate, rbac('admin', 'purchaser'), async (req, res) => {
  try {
    const deposit = await SecurityDeposit.create(req.body);
    res.status(201).json({ success: true, data: deposit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id/refund', authenticate, rbac('admin'), async (req, res) => {
  try {
    const deposit = await SecurityDeposit.findByIdAndUpdate(
      req.params.id,
      { status: 'refunded', refundDate: new Date() },
      { new: true }
    );
    if (!deposit) return res.status(404).json({ success: false, message: 'Deposit not found.' });
    res.json({ success: true, data: deposit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
