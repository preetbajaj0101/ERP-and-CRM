const express = require('express');
const { Transaction, Customer, Vendor, Inventory, Cylinder } = require('../models');
const authenticate = require('../middleware/auth');
const router = express.Router();

router.get('/stats', authenticate, async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today - 30 * 24 * 60 * 60 * 1000);

    const [totalCustomers, totalVendors, totalCylinders, cylindersByStatus] = await Promise.all([
      Customer.countDocuments(),
      Vendor.countDocuments(),
      Cylinder.countDocuments(),
      Cylinder.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    // Recent sales totals
    const recentSales = await Transaction.aggregate([
      { $match: { type: 'sale', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
    ]);

    // Outstanding balances
    const outstandingCustomers = await Customer.aggregate([
      { $match: { currentBalance: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$currentBalance' }, count: { $sum: 1 } } },
    ]);

    // Low stock items
    const inventory = await Inventory.find();
    const lowStock = inventory.filter(i => {
      if (i.itemType === 'gas_cylinder') return i.quantityFull <= i.reorderLevel;
      return i.quantityTotal <= i.reorderLevel;
    });

    // Sales trend (last 7 days)
    const sevenDaysAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);
    const salesTrendRaw = await Transaction.aggregate([
      { $match: { type: 'sale', createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$grandTotal' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build a map of existing data, then fill all 7 days
    const trendMap = {};
    salesTrendRaw.forEach(r => {
      trendMap[r._id] = { date: r._id, total: r.total || 0, count: r.count || 0 };
    });
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      salesTrend.push(trendMap[key] || { date: key, total: 0, count: 0 });
    }

    res.json({
      success: true,
      data: {
        totalCustomers, totalVendors, totalCylinders,
        cylindersByStatus: Object.fromEntries(cylindersByStatus.map(c => [c._id, c.count])),
        monthlySales: { total: recentSales[0]?.total || 0, count: recentSales[0]?.count || 0 },
        outstanding: { total: outstandingCustomers[0]?.total || 0, count: outstandingCustomers[0]?.count || 0 },
        lowStockCount: lowStock.length,
        salesTrend,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
