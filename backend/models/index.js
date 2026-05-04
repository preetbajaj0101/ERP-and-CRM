const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions || {},
  }
);

// ─── Models ───────────────────────────────────────────────
const User = require('./User')(sequelize);
const Customer = require('./Customer')(sequelize);
const Vendor = require('./Vendor')(sequelize);
const GasType = require('./GasType')(sequelize);
const Cylinder = require('./Cylinder')(sequelize);
const Inventory = require('./Inventory')(sequelize);
const Transaction = require('./Transaction')(sequelize);
const TransactionItem = require('./TransactionItem')(sequelize);
const LedgerEntry = require('./LedgerEntry')(sequelize);
const SecurityDeposit = require('./SecurityDeposit')(sequelize);
const Invoice = require('./Invoice')(sequelize);

// ─── Associations ─────────────────────────────────────────

// Cylinders belong to a gas type
GasType.hasMany(Cylinder, { foreignKey: 'gasTypeId', as: 'cylinders' });
Cylinder.belongsTo(GasType, { foreignKey: 'gasTypeId', as: 'gasType' });

// Cylinders can be held by a customer
Customer.hasMany(Cylinder, { foreignKey: 'currentHolderId', as: 'heldCylinders' });
Cylinder.belongsTo(Customer, { foreignKey: 'currentHolderId', as: 'currentHolder' });

// Inventory categorized by gas type
GasType.hasMany(Inventory, { foreignKey: 'gasTypeId', as: 'inventory' });
Inventory.belongsTo(GasType, { foreignKey: 'gasTypeId', as: 'gasType' });

// Transactions
Customer.hasMany(Transaction, { foreignKey: 'customerId', as: 'transactions' });
Transaction.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Vendor.hasMany(Transaction, { foreignKey: 'vendorId', as: 'transactions' });
Transaction.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });

User.hasMany(Transaction, { foreignKey: 'createdBy', as: 'createdTransactions' });
Transaction.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Transaction Items
Transaction.hasMany(TransactionItem, { foreignKey: 'transactionId', as: 'items' });
TransactionItem.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

Inventory.hasMany(TransactionItem, { foreignKey: 'inventoryId', as: 'transactionItems' });
TransactionItem.belongsTo(Inventory, { foreignKey: 'inventoryId', as: 'inventoryItem' });

Cylinder.hasMany(TransactionItem, { foreignKey: 'cylinderId', as: 'transactionItems' });
TransactionItem.belongsTo(Cylinder, { foreignKey: 'cylinderId', as: 'cylinder' });

// Ledger Entries
Customer.hasMany(LedgerEntry, { foreignKey: 'customerId', as: 'ledgerEntries' });
LedgerEntry.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Vendor.hasMany(LedgerEntry, { foreignKey: 'vendorId', as: 'ledgerEntries' });
LedgerEntry.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });

Transaction.hasMany(LedgerEntry, { foreignKey: 'transactionId', as: 'ledgerEntries' });
LedgerEntry.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

// Security Deposits
Customer.hasMany(SecurityDeposit, { foreignKey: 'customerId', as: 'securityDeposits' });
SecurityDeposit.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Cylinder.hasMany(SecurityDeposit, { foreignKey: 'cylinderId', as: 'securityDeposits' });
SecurityDeposit.belongsTo(Cylinder, { foreignKey: 'cylinderId', as: 'cylinder' });

// Invoices
Transaction.hasOne(Invoice, { foreignKey: 'transactionId', as: 'invoice' });
Invoice.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

const db = {
  sequelize,
  Sequelize,
  User,
  Customer,
  Vendor,
  GasType,
  Cylinder,
  Inventory,
  Transaction,
  TransactionItem,
  LedgerEntry,
  SecurityDeposit,
  Invoice,
};

module.exports = db;
