const express = require('express');
const { LedgerEntry, Customer, Vendor } = require('../models');
const authenticate = require('../middleware/auth');
const router = express.Router();

// Get customer ledger
router.get('/customer/:customerId', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });

    const total = await LedgerEntry.countDocuments({ customerId: req.params.customerId });
    const entries = await LedgerEntry.find({ customerId: req.params.customerId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      data: { customer: { name: customer.name, currentBalance: customer.currentBalance }, entries },
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get vendor ledger
router.get('/vendor/:vendorId', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const vendor = await Vendor.findById(req.params.vendorId);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found.' });

    const total = await LedgerEntry.countDocuments({ vendorId: req.params.vendorId });
    const entries = await LedgerEntry.find({ vendorId: req.params.vendorId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      data: { vendor: { name: vendor.name, currentBalance: vendor.currentBalance }, entries },
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all outstanding balances
router.get('/outstanding', authenticate, async (req, res) => {
  try {
    const customers = await Customer.find({ currentBalance: { $gt: 0 } })
      .select('name phone currentBalance')
      .sort({ currentBalance: -1 });

    const totalOutstanding = customers.reduce((s, c) => s + c.currentBalance, 0);
    res.json({ success: true, data: { customers, totalOutstanding } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
