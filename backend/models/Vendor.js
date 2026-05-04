const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vendor = sequelize.define('Vendor', {
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
    currentBalance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      field: 'current_balance',
      comment: 'Positive = we owe vendor, Negative = vendor owes us',
    },
  }, {
    tableName: 'vendors',
    underscored: true,
    timestamps: true,
  });

  return Vendor;
};
