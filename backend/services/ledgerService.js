const { LedgerEntry, Customer, Vendor, sequelize } = require('../models');

/**
 * Ledger Service - Manages all credit/debit entries and running balances
 */
class LedgerService {
  /**
   * Record a customer ledger entry and update their running balance
   */
  static async recordCustomerEntry({ customerId, transactionId, entryType, amount, description, date, transaction: t }) {
    const customer = await Customer.findByPk(customerId, { transaction: t });
    if (!customer) throw new Error('Customer not found');

    let newBalance;
    if (entryType === 'debit') {
      // Customer owes more (sale on credit)
      newBalance = parseFloat(customer.currentBalance) + parseFloat(amount);
    } else {
      // Customer paid (credit entry)
      newBalance = parseFloat(customer.currentBalance) - parseFloat(amount);
    }

    const entry = await LedgerEntry.create({
      customerId,
      transactionId,
      entryType,
      amount,
      runningBalance: newBalance,
      description,
      date: date || new Date(),
    }, { transaction: t });

    await customer.update({ currentBalance: newBalance }, { transaction: t });

    return entry;
  }

  /**
   * Record a vendor ledger entry and update their running balance
   */
  static async recordVendorEntry({ vendorId, transactionId, entryType, amount, description, date, transaction: t }) {
    const vendor = await Vendor.findByPk(vendorId, { transaction: t });
    if (!vendor) throw new Error('Vendor not found');

    let newBalance;
    if (entryType === 'debit') {
      // We owe vendor more (purchase)
      newBalance = parseFloat(vendor.currentBalance) + parseFloat(amount);
    } else {
      // We paid vendor (credit)
      newBalance = parseFloat(vendor.currentBalance) - parseFloat(amount);
    }

    const entry = await LedgerEntry.create({
      vendorId,
      transactionId,
      entryType,
      amount,
      runningBalance: newBalance,
      description,
      date: date || new Date(),
    }, { transaction: t });

    await vendor.update({ currentBalance: newBalance }, { transaction: t });

    return entry;
  }

  /**
   * Get full ledger history for a customer
   */
  static async getCustomerLedger(customerId, { limit = 50, offset = 0 } = {}) {
    return LedgerEntry.findAndCountAll({
      where: { customerId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  /**
   * Get full ledger history for a vendor
   */
  static async getVendorLedger(vendorId, { limit = 50, offset = 0 } = {}) {
    return LedgerEntry.findAndCountAll({
      where: { vendorId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }
}

module.exports = LedgerService;
