const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Invoice = sequelize.define('Invoice', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    transactionId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'transaction_id',
    },
    invoiceNumber: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      field: 'invoice_number',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'total_amount',
    },
    taxAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      field: 'tax_amount',
    },
    grandTotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'grand_total',
    },
    pdfPath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'pdf_path',
    },
    generatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'generated_at',
    },
  }, {
    tableName: 'invoices',
    underscored: true,
    timestamps: true,
  });

  return Invoice;
};
