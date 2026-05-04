const express = require('express');
const { LedgerEntry, Customer, Vendor } = require('../models');
const authenticate = require('../middleware/auth');
const router = express.Router();

// Get customer ledger
router.get('/customer/:customerId', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const customer = await Customer.findByPk(req.params.customerId);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });
    const entries = await LedgerEntry.findAndCountAll({
      where: { customerId: req.params.customerId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
    res.json({
      success: true,
      data: { customer: { name: customer.name, currentBalance: customer.currentBalance }, entries: entries.rows },
      pagination: { total: entries.count, page: parseInt(page), pages: Math.ceil(entries.count / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get vendor ledger
router.get('/vendor/:vendorId', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const vendor = await Vendor.findByPk(req.params.vendorId);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found.' });
    const entries = await LedgerEntry.findAndCountAll({
      where: { vendorId: req.params.vendorId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
    res.json({
      success: true,
      data: { vendor: { name: vendor.name, currentBalance: vendor.currentBalance }, entries: entries.rows },
      pagination: { total: entries.count, page: parseInt(page), pages: Math.ceil(entries.count / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all outstanding balances
router.get('/outstanding', authenticate, async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const customers = await Customer.findAll({
      where: { currentBalance: { [Op.gt]: 0 } },
      attributes: ['id', 'name', 'phone', 'currentBalance'],
      order: [['currentBalance', 'DESC']],
    });
    const totalOutstanding = customers.reduce((s, c) => s + parseFloat(c.currentBalance), 0);
    res.json({ success: true, data: { customers, totalOutstanding } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
