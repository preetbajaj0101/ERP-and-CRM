const express = require('express');
const { Transaction, TransactionItem, Customer, Vendor, Inventory, Cylinder, Invoice, sequelize } = require('../models');
const authenticate = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const LedgerService = require('../services/ledgerService');
const PDFService = require('../services/pdfService');
const router = express.Router();

// Get all transactions
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const where = {};
    if (type) where.type = type;
    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'name'] },
        { model: Vendor, as: 'vendor', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
    res.json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single transaction with items
router.get('/:id', authenticate, async (req, res) => {
  try {
    const txn = await Transaction.findByPk(req.params.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Vendor, as: 'vendor' },
        { model: TransactionItem, as: 'items', include: [{ model: Inventory, as: 'inventoryItem' }] },
        { model: Invoice, as: 'invoice' },
      ],
    });
    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    res.json({ success: true, data: txn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create sale transaction
router.post('/sale', authenticate, rbac('admin', 'purchaser'), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { customerId, items, paymentMethod, paidAmount, notes, taxAmount = 0, discountAmount = 0 } = req.body;
    let totalAmount = 0;
    // Validate and calculate
    for (const item of items) {
      const inv = await Inventory.findByPk(item.inventoryId, { transaction: t });
      if (!inv) throw new Error(`Inventory item not found: ${item.inventoryId}`);
      totalAmount += item.quantity * (item.unitPrice || parseFloat(inv.unitPrice));
    }
    const grandTotal = totalAmount + parseFloat(taxAmount) - parseFloat(discountAmount);
    const paymentStatus = paidAmount >= grandTotal ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';

    const transaction = await Transaction.create({
      type: 'sale', customerId, createdBy: req.user.id,
      totalAmount, taxAmount, discountAmount, grandTotal, paidAmount: paidAmount || 0,
      paymentStatus, paymentMethod, notes,
    }, { transaction: t });

    // Create items and update inventory
    for (const item of items) {
      const inv = await Inventory.findByPk(item.inventoryId, { transaction: t });
      const unitPrice = item.unitPrice || parseFloat(inv.unitPrice);
      await TransactionItem.create({
        transactionId: transaction.id, inventoryId: item.inventoryId,
        cylinderId: item.cylinderId || null, quantity: item.quantity,
        unitPrice, totalPrice: item.quantity * unitPrice,
      }, { transaction: t });
      // Update stock
      if (inv.itemType === 'gas_cylinder') {
        await inv.update({ quantityFull: inv.quantityFull - item.quantity }, { transaction: t });
      } else {
        await inv.update({ quantityTotal: inv.quantityTotal - item.quantity }, { transaction: t });
      }
      // Update cylinder status if tracked
      if (item.cylinderId) {
        await Cylinder.update({ status: 'with_customer', currentHolderId: customerId }, { where: { id: item.cylinderId }, transaction: t });
      }
    }

    // Ledger entry - debit customer (they owe us)
    await LedgerService.recordCustomerEntry({
      customerId, transactionId: transaction.id,
      entryType: 'debit', amount: grandTotal,
      description: `Sale - Invoice`, transaction: t,
    });
    // If payment received, credit entry
    if (paidAmount > 0) {
      await LedgerService.recordCustomerEntry({
        customerId, transactionId: transaction.id,
        entryType: 'credit', amount: paidAmount,
        description: `Payment received (${paymentMethod})`, transaction: t,
      });
    }

    await t.commit();
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ success: false, message: error.message });
  }
});

// Create purchase transaction
router.post('/purchase', authenticate, rbac('admin', 'purchaser'), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { vendorId, items, paymentMethod, paidAmount, notes, taxAmount = 0 } = req.body;
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.quantity * item.unitPrice;
    }
    const grandTotal = totalAmount + parseFloat(taxAmount);
    const paymentStatus = paidAmount >= grandTotal ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';

    const transaction = await Transaction.create({
      type: 'purchase', vendorId, createdBy: req.user.id,
      totalAmount, taxAmount, grandTotal, paidAmount: paidAmount || 0,
      paymentStatus, paymentMethod, notes,
    }, { transaction: t });

    for (const item of items) {
      await TransactionItem.create({
        transactionId: transaction.id, inventoryId: item.inventoryId,
        quantity: item.quantity, unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      }, { transaction: t });
      const inv = await Inventory.findByPk(item.inventoryId, { transaction: t });
      if (inv.itemType === 'gas_cylinder') {
        await inv.update({ quantityFull: inv.quantityFull + item.quantity }, { transaction: t });
      } else {
        await inv.update({ quantityTotal: inv.quantityTotal + item.quantity }, { transaction: t });
      }
    }

    await LedgerService.recordVendorEntry({
      vendorId, transactionId: transaction.id,
      entryType: 'debit', amount: grandTotal,
      description: `Purchase from vendor`, transaction: t,
    });
    if (paidAmount > 0) {
      await LedgerService.recordVendorEntry({
        vendorId, transactionId: transaction.id,
        entryType: 'credit', amount: paidAmount,
        description: `Payment made (${paymentMethod})`, transaction: t,
      });
    }

    await t.commit();
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ success: false, message: error.message });
  }
});

// Generate invoice PDF
router.post('/:id/invoice', authenticate, async (req, res) => {
  try {
    const txn = await Transaction.findByPk(req.params.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Vendor, as: 'vendor' },
        { model: TransactionItem, as: 'items', include: [{ model: Inventory, as: 'inventoryItem' }] },
      ],
    });
    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    const party = txn.customer || txn.vendor;
    const { invoiceNumber, filePath } = await PDFService.generateInvoice(txn, txn.items, party);
    const invoice = await Invoice.create({
      transactionId: txn.id, invoiceNumber,
      totalAmount: txn.totalAmount, taxAmount: txn.taxAmount, grandTotal: txn.grandTotal,
      pdfPath: filePath,
    });
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
