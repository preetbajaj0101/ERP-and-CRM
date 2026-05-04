const express = require('express');
const { SecurityDeposit, Customer, Cylinder, GasType } = require('../models');
const authenticate = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, customerId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    const deposits = await SecurityDeposit.findAll({
      where,
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone'] },
        { model: Cylinder, as: 'cylinder', attributes: ['id', 'serialNumber'], include: [{ model: GasType, as: 'gasType', attributes: ['name'] }] },
      ],
      order: [['depositDate', 'DESC']],
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
    const deposit = await SecurityDeposit.findByPk(req.params.id);
    if (!deposit) return res.status(404).json({ success: false, message: 'Deposit not found.' });
    await deposit.update({ status: 'refunded', refundDate: new Date() });
    res.json({ success: true, data: deposit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
