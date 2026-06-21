const express = require('express');
const mongoose = require('mongoose');
const { DamageReport, Cylinder, Customer, Inventory, GasType, User } = require('../models');
const authenticate = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const router = express.Router();

// ─── Helper: generate report number ──────────────────────
async function generateReportNumber() {
  const year = new Date().getFullYear();
  const prefix = `DMG-${year}-`;
  const last = await DamageReport.findOne({ reportNumber: { $regex: `^${prefix}` } })
    .sort({ reportNumber: -1 });
  const seq = last ? parseInt(last.reportNumber.split('-').pop()) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

// ─── Get all damage reports ──────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, category, severity, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.itemCategory = category;
    if (severity) query.severity = severity;
    if (search) {
      query.$or = [
        { reportNumber: { $regex: search, $options: 'i' } },
        { itemDescription: { $regex: search, $options: 'i' } },
      ];
    }

    let reports = await DamageReport.find(query)
      .populate({ path: 'cylinderId', populate: { path: 'gasTypeId' } })
      .populate('customerId', 'name phone')
      .populate('inventoryId', 'itemName itemType')
      .populate('reportedBy', 'name')
      .sort({ createdAt: -1 });

    reports = reports.map(r => {
      const obj = r.toObject();
      if (obj.cylinderId) { obj.cylinder = { ...obj.cylinderId, gasType: obj.cylinderId.gasTypeId }; }
      obj.customer = obj.customerId;
      obj.inventoryItem = obj.inventoryId;
      obj.reporter = obj.reportedBy;
      return obj;
    });

    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Get damage report summary ───────────────────────────
router.get('/summary', authenticate, async (req, res) => {
  try {
    const byStatus = await DamageReport.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const byCategory = await DamageReport.aggregate([{ $group: { _id: '$itemCategory', count: { $sum: 1 } } }]);
    const bySeverity = await DamageReport.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]);

    const totals = await DamageReport.aggregate([{
      $group: {
        _id: null,
        totalLoss: { $sum: { $ifNull: ['$estimatedLoss', 0] } },
        totalRepairCost: { $sum: { $ifNull: ['$repairCost', 0] } },
        totalCharged: { $sum: { $ifNull: ['$chargedAmount', 0] } },
      },
    }]);

    const statusSummary = { reported: 0, under_review: 0, repairable: 0, written_off: 0, repaired: 0, resolved: 0 };
    byStatus.forEach(s => { statusSummary[s._id] = s.count; });

    const categorySummary = {};
    byCategory.forEach(c => { categorySummary[c._id] = c.count; });

    const severitySummary = { minor: 0, moderate: 0, severe: 0, total_loss: 0 };
    bySeverity.forEach(s => { severitySummary[s._id] = s.count; });

    res.json({
      success: true,
      data: {
        byStatus: statusSummary,
        byCategory: categorySummary,
        bySeverity: severitySummary,
        totalReports: Object.values(statusSummary).reduce((a, b) => a + b, 0),
        openReports: (statusSummary.reported || 0) + (statusSummary.under_review || 0) + (statusSummary.repairable || 0),
        totalEstimatedLoss: totals[0]?.totalLoss || 0,
        totalRepairCost: totals[0]?.totalRepairCost || 0,
        totalCharged: totals[0]?.totalCharged || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Create damage report ────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const reportNumber = await generateReportNumber();
    const reportData = {
      ...req.body,
      reportNumber,
      reportedBy: req.user._id,
      damageDate: req.body.damageDate || new Date(),
    };

    const [report] = await DamageReport.create([reportData], { session });

    if (req.body.cylinderId) {
      await Cylinder.findByIdAndUpdate(req.body.cylinderId, { status: 'damaged' }, { session });
    }

    await session.commitTransaction();

    const result = await DamageReport.findById(report._id)
      .populate({ path: 'cylinderId', populate: { path: 'gasTypeId' } })
      .populate('customerId', 'name phone')
      .populate('inventoryId', 'itemName itemType')
      .populate('reportedBy', 'name');

    const obj = result.toObject();
    if (obj.cylinderId) { obj.cylinder = { ...obj.cylinderId, gasType: obj.cylinderId.gasTypeId }; }
    obj.customer = obj.customerId;
    obj.inventoryItem = obj.inventoryId;
    obj.reporter = obj.reportedBy;

    res.status(201).json({ success: true, data: obj });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
});

// ─── Update damage report ────────────────────────────────
router.put('/:id', authenticate, rbac('admin', 'purchaser'), async (req, res) => {
  try {
    const report = await DamageReport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!report) return res.status(404).json({ success: false, message: 'Damage report not found.' });

    const result = await DamageReport.findById(report._id)
      .populate({ path: 'cylinderId', populate: { path: 'gasTypeId' } })
      .populate('customerId', 'name phone')
      .populate('inventoryId', 'itemName itemType');

    const obj = result.toObject();
    if (obj.cylinderId) { obj.cylinder = { ...obj.cylinderId, gasType: obj.cylinderId.gasTypeId }; }
    obj.customer = obj.customerId;
    obj.inventoryItem = obj.inventoryId;

    res.json({ success: true, data: obj });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─── Resolve / close a damage report ─────────────────────
router.post('/:id/resolve', authenticate, rbac('admin', 'purchaser'), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const report = await DamageReport.findById(req.params.id).session(session);
    if (!report) return res.status(404).json({ success: false, message: 'Damage report not found.' });

    const { status, resolution, repairCost, chargeToCustomer, chargedAmount } = req.body;

    Object.assign(report, {
      status: status || 'resolved',
      resolution,
      repairCost: repairCost || report.repairCost,
      chargeToCustomer: chargeToCustomer || false,
      chargedAmount: chargedAmount || 0,
      resolvedAt: new Date(),
    });
    await report.save({ session });

    if (report.cylinderId && (status === 'repaired' || status === 'resolved')) {
      await Cylinder.findByIdAndUpdate(report.cylinderId, { status: 'empty' }, { session });
    }
    if (report.cylinderId && status === 'written_off') {
      await Cylinder.findByIdAndUpdate(report.cylinderId, { status: 'retired' }, { session });
    }

    await session.commitTransaction();
    res.json({ success: true, data: report });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
});

// ─── Delete damage report ────────────────────────────────
router.delete('/:id', authenticate, rbac('admin'), async (req, res) => {
  try {
    const report = await DamageReport.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Damage report not found.' });
    res.json({ success: true, message: 'Damage report deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
