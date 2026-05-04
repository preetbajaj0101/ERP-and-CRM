const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LedgerEntry = sequelize.define('LedgerEntry', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'customer_id',
    },
    vendorId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'vendor_id',
    },
    transactionId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'transaction_id',
    },
    entryType: {
      type: DataTypes.ENUM('credit', 'debit'),
      allowNull: false,
      field: 'entry_type',
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    runningBalance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'running_balance',
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'ledger_entries',
    underscored: true,
    timestamps: true,
  });

  return LedgerEntry;
};
