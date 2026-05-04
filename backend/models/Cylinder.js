const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cylinder = sequelize.define('Cylinder', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    serialNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'serial_number',
    },
    gasTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'gas_type_id',
    },
    status: {
      type: DataTypes.ENUM('full', 'empty', 'in_refill', 'with_customer', 'damaged', 'retired'),
      allowNull: false,
      defaultValue: 'empty',
    },
    currentHolderId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'current_holder_id',
      comment: 'Customer ID if currently with a customer',
    },
    size: {
      type: DataTypes.ENUM('small', 'medium', 'large', 'jumbo'),
      allowNull: false,
      defaultValue: 'medium',
    },
    purchaseCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'purchase_cost',
    },
    depositAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'deposit_amount',
      comment: 'Standard security deposit for this cylinder',
    },
    lastRefillDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'last_refill_date',
    },
    nextRefillDue: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'next_refill_due',
    },
    testDueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'test_due_date',
      comment: 'Hydrostatic test due date',
    },
  }, {
    tableName: 'cylinders',
    underscored: true,
    timestamps: true,
  });

  return Cylinder;
};
