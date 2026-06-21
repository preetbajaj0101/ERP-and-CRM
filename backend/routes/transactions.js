const express = require('express');
const mongoose = require('mongoose');
const { Transaction, TransactionItem, Customer, Vendor, Inventory, Cylinder, Invoice } = require('../models');
const authenticate = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const LedgerService = require('../services/ledgerService');
const PDFService = require('../services/pdfService');
const router = express.Router();

// Get all transactions
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const query = {};
    if (type) query.type = type;

    const total = await Transaction.countDocuments(query);
    const rows = await Transaction.find(query)
      .populate('customerId', 'name')
      .populate('vendorId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Map for frontend compatibility
    const data = rows.map(r => {
      const obj = r.toObject();
      obj.customer = obj.customerId;
      obj.vendor = obj.vendorId;
      return obj;
    });

    res.json({ success: true, data, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single transaction with items
router.get('/:id', authenticate, async (req, res) => {
  try {
    const txn = await Transaction.findById(req.params.id)
      .populate('customerId')
      .populate('vendorId');

    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found.' });

    const items = await TransactionItem.find({ transactionId: txn._id }).populate('inventoryId');
    const invoice = await Invoice.findOne({ transactionId: txn._id });

    const obj = txn.toObject();
    obj.customer = obj.customerId;
    obj.vendor = obj.vendorId;
    obj.items = items.map(i => { const io = i.toObject(); io.inventoryItem = io.inventoryId; return io; });
    obj.invoice = invoice;

    res.json({ success: true, data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create sale transaction
router.post('/sale', authenticate, rbac('admin', 'purchaser'), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { customerId, items, paymentMethod, paidAmount, notes, taxAmount = 0, discountAmount = 0 } = req.body;
    let totalAmount = 0;

    for (const item of items) {
      const inv = await Inventory.findById(item.inventoryId).session(session);
      if (!inv) throw new Error(`Inventory item not found: ${item.inventoryId}`);
      totalAmount += item.quantity * (item.unitPrice || inv.unitPrice);
    }

    const grandTotal = totalAmount + parseFloat(taxAmount) - parseFloat(discountAmount);
    const paymentStatus = paidAmount >= grandTotal ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';

    const [transaction] = await Transaction.create([{
      type: 'sale', customerId, createdBy: req.user._id,
      totalAmount, taxAmount, discountAmount, grandTotal, paidAmount: paidAmount || 0,
      paymentStatus, paymentMethod, notes,
    }], { session });

    for (const item of items) {
      const inv = await Inventory.findById(item.inventoryId).session(session);
      const unitPrice = item.unitPrice || inv.unitPrice;
      await TransactionItem.create([{
        transactionId: transaction._id, inventoryId: item.inventoryId,
        cylinderId: item.cylinderId || null, quantity: item.quantity,
        unitPrice, totalPrice: item.quantity * unitPrice,
      }], { session });

      if (inv.itemType === 'gas_cylinder') {
        await Inventory.findByIdAndUpdate(inv._id, { quantityFull: inv.quantityFull - item.quantity }, { session });
      } else {
        await Inventory.findByIdAndUpdate(inv._id, { quantityTotal: inv.quantityTotal - item.quantity }, { session });
      }

      if (item.cylinderId) {
        await Cylinder.findByIdAndUpdate(item.cylinderId, { status: 'with_customer', currentHolderId: customerId }, { session });
      }
    }

    await LedgerService.recordCustomerEntry({
      customerId, transactionId: transaction._id,
      entryType: 'debit', amount: grandTotal,
      description: 'Sale - Invoice', session,
    });
    if (paidAmount > 0) {
      await LedgerService.recordCustomerEntry({
        customerId, transactionId: transaction._id,
        entryType: 'credit', amount: paidAmount,
        description: `Payment received (${paymentMethod})`, session,
      });
    }

    await session.commitTransaction();
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
});

// Create purchase transaction
router.post('/purchase', authenticate, rbac('admin', 'purchaser'), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { vendorId, items, paymentMethod, paidAmount, notes, taxAmount = 0 } = req.body;
    let totalAmount = 0;
    for (const item of items) { totalAmount += item.quantity * item.unitPrice; }
    const grandTotal = totalAmount + parseFloat(taxAmount);
    const paymentStatus = paidAmount >= grandTotal ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';

    const [transaction] = await Transaction.create([{
      type: 'purchase', vendorId, createdBy: req.user._id,
      totalAmount, taxAmount, grandTotal, paidAmount: paidAmount || 0,
      paymentStatus, paymentMethod, notes,
    }], { session });

    for (const item of items) {
      await TransactionItem.create([{
        transactionId: transaction._id, inventoryId: item.inventoryId,
        quantity: item.quantity, unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      }], { session });
      const inv = await Inventory.findById(item.inventoryId).session(session);
      if (inv.itemType === 'gas_cylinder') {
        await Inventory.findByIdAndUpdate(inv._id, { quantityFull: inv.quantityFull + item.quantity }, { session });
      } else {
        await Inventory.findByIdAndUpdate(inv._id, { quantityTotal: inv.quantityTotal + item.quantity }, { session });
      }
    }

    await LedgerService.recordVendorEntry({
      vendorId, transactionId: transaction._id,
      entryType: 'debit', amount: grandTotal,
      description: 'Purchase from vendor', session,
    });
    if (paidAmount > 0) {
      await LedgerService.recordVendorEntry({
        vendorId, transactionId: transaction._id,
        entryType: 'credit', amount: paidAmount,
        description: `Payment made (${paymentMethod})`, session,
      });
    }

    await session.commitTransaction();
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
});

// Generate invoice PDF
router.post('/:id/invoice', authenticate, async (req, res) => {
  try {
    const txn = await Transaction.findById(req.params.id)
      .populate('customerId')
      .populate('vendorId');
    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found.' });

    const txnItems = await TransactionItem.find({ transactionId: txn._id }).populate('inventoryId');
    const items = txnItems.map(i => { const io = i.toObject(); io.inventoryItem = io.inventoryId; return io; });

    const party = txn.customerId || txn.vendorId;
    const { invoiceNumber, filePath } = await PDFService.generateInvoice(txn, items, party);

    const invoice = await Invoice.create({
      transactionId: txn._id, invoiceNumber,
      totalAmount: txn.totalAmount, taxAmount: txn.taxAmount, grandTotal: txn.grandTotal,
      pdfPath: filePath,
    });
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
