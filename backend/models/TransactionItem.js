const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TransactionItem = sequelize.define('TransactionItem', {
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
    inventoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'inventory_id',
    },
    cylinderId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'cylinder_id',
      comment: 'Linked cylinder serial for tracking',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'unit_price',
    },
    totalPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'total_price',
    },
  }, {
    tableName: 'transaction_items',
    underscored: true,
    timestamps: true,
  });

  return TransactionItem;
};
