const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('sale', 'purchase', 'refill', 'return', 'payment_received', 'payment_made'),
      allowNull: false,
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
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'created_by',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'total_amount',
    },
    taxAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      field: 'tax_amount',
    },
    discountAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      field: 'discount_amount',
    },
    grandTotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'grand_total',
    },
    paidAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      field: 'paid_amount',
    },
    paymentStatus: {
      type: DataTypes.ENUM('paid', 'partial', 'unpaid'),
      allowNull: false,
      defaultValue: 'unpaid',
      field: 'payment_status',
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'upi', 'bank_transfer', 'credit', 'cheque'),
      allowNull: true,
      field: 'payment_method',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'transactions',
    underscored: true,
    timestamps: true,
  });

  return Transaction;
};
