const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SecurityDeposit = sequelize.define('SecurityDeposit', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'customer_id',
    },
    cylinderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'cylinder_id',
    },
    depositAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'deposit_amount',
    },
    status: {
      type: DataTypes.ENUM('active', 'refunded', 'forfeited', 'adjusted'),
      allowNull: false,
      defaultValue: 'active',
    },
    depositDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'deposit_date',
    },
    refundDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'refund_date',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'security_deposits',
    underscored: true,
    timestamps: true,
  });

  return SecurityDeposit;
};
