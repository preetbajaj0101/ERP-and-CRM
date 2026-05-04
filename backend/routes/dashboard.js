const express = require('express');
const { Transaction, Customer, Vendor, Inventory, Cylinder, GasType, LedgerEntry, sequelize } = require('../models');
const authenticate = require('../middleware/auth');
const router = express.Router();

router.get('/stats', authenticate, async (req, res) => {
  try {
    const { fn, col, Op } = require('sequelize');
    const today = new Date();
    const thirtyDaysAgo = new Date(today - 30 * 24 * 60 * 60 * 1000);

    const [totalCustomers, totalVendors, totalCylinders, cylindersByStatus] = await Promise.all([
      Customer.count(),
      Vendor.count(),
      Cylinder.count(),
      Cylinder.findAll({ attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true }),
    ]);

    // Recent sales totals
    const recentSales = await Transaction.findAll({
      where: { type: 'sale', createdAt: { [Op.gte]: thirtyDaysAgo } },
      attributes: [[fn('SUM', col('grand_total')), 'total'], [fn('COUNT', col('id')), 'count']],
      raw: true,
    });

    // Outstanding balances
    const outstandingCustomers = await Customer.findAll({
      where: { currentBalance: { [Op.gt]: 0 } },
      attributes: [[fn('SUM', col('current_balance')), 'total'], [fn('COUNT', col('id')), 'count']],
      raw: true,
    });

    // Low stock items
    const inventory = await Inventory.findAll();
    const lowStock = inventory.filter(i => {
      if (i.itemType === 'gas_cylinder') return i.quantityFull <= i.reorderLevel;
      return i.quantityTotal <= i.reorderLevel;
    });

    // Sales trend (last 7 days)
    const salesTrend = await Transaction.findAll({
      where: { type: 'sale', createdAt: { [Op.gte]: new Date(today - 7 * 24 * 60 * 60 * 1000) } },
      attributes: [[fn('DATE', col('created_at')), 'date'], [fn('SUM', col('grand_total')), 'total'], [fn('COUNT', col('id')), 'count']],
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        totalCustomers, totalVendors, totalCylinders,
        cylindersByStatus: Object.fromEntries(cylindersByStatus.map(c => [c.status, parseInt(c.count)])),
        monthlySales: { total: parseFloat(recentSales[0]?.total || 0), count: parseInt(recentSales[0]?.count || 0) },
        outstanding: { total: parseFloat(outstandingCustomers[0]?.total || 0), count: parseInt(outstandingCustomers[0]?.count || 0) },
        lowStockCount: lowStock.length,
        salesTrend,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
