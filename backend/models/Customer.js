const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gstNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'gst_number',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    creditLimit: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      field: 'credit_limit',
    },
    currentBalance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      field: 'current_balance',
      comment: 'Positive = customer owes us, Negative = we owe customer',
    },
  }, {
    tableName: 'customers',
    underscored: true,
    timestamps: true,
  });

  return Customer;
};
