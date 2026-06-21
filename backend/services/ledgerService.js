const { LedgerEntry, Customer, Vendor } = require('../models');

/**
 * Ledger Service - Manages all credit/debit entries and running balances
 */
class LedgerService {
  /**
   * Record a customer ledger entry and update their running balance
   */
  static async recordCustomerEntry({ customerId, transactionId, entryType, amount, description, date, session }) {
    const customer = await Customer.findById(customerId).session(session || null);
    if (!customer) throw new Error('Customer not found');

    let newBalance;
    if (entryType === 'debit') {
      // Customer owes more (sale on credit)
      newBalance = customer.currentBalance + parseFloat(amount);
    } else {
      // Customer paid (credit entry)
      newBalance = customer.currentBalance - parseFloat(amount);
    }

    const entryData = {
      customerId,
      transactionId,
      entryType,
      amount,
      runningBalance: newBalance,
      description,
      date: date || new Date(),
    };

    let entry;
    if (session) {
      [entry] = await LedgerEntry.create([entryData], { session });
    } else {
      entry = await LedgerEntry.create(entryData);
    }

    await Customer.findByIdAndUpdate(customerId, { currentBalance: newBalance }, { session: session || null });

    return entry;
  }

  /**
   * Record a vendor ledger entry and update their running balance
   */
  static async recordVendorEntry({ vendorId, transactionId, entryType, amount, description, date, session }) {
    const vendor = await Vendor.findById(vendorId).session(session || null);
    if (!vendor) throw new Error('Vendor not found');

    let newBalance;
    if (entryType === 'debit') {
      // We owe vendor more (purchase)
      newBalance = vendor.currentBalance + parseFloat(amount);
    } else {
      // We paid vendor (credit)
      newBalance = vendor.currentBalance - parseFloat(amount);
    }

    const entryData = {
      vendorId,
      transactionId,
      entryType,
      amount,
      runningBalance: newBalance,
      description,
      date: date || new Date(),
    };

    let entry;
    if (session) {
      [entry] = await LedgerEntry.create([entryData], { session });
    } else {
      entry = await LedgerEntry.create(entryData);
    }

    await Vendor.findByIdAndUpdate(vendorId, { currentBalance: newBalance }, { session: session || null });

    return entry;
  }

  /**
   * Get full ledger history for a customer
   */
  static async getCustomerLedger(customerId, { limit = 50, offset = 0 } = {}) {
    const total = await LedgerEntry.countDocuments({ customerId });
    const rows = await LedgerEntry.find({ customerId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
    return { count: total, rows };
  }

  /**
   * Get full ledger history for a vendor
   */
  static async getVendorLedger(vendorId, { limit = 50, offset = 0 } = {}) {
    const total = await LedgerEntry.countDocuments({ vendorId });
    const rows = await LedgerEntry.find({ vendorId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
    return { count: total, rows };
  }
}

module.exports = LedgerService;
