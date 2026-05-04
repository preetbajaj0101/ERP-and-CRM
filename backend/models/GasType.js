const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GasType = sequelize.define('GasType', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    formula: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Chemical formula e.g. O2, CO2, Ar',
    },
    unit: {
      type: DataTypes.ENUM('kg', 'litre', 'cubic_m', 'cylinder'),
      allowNull: false,
      defaultValue: 'cylinder',
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'base_price',
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      comment: 'Hex color for UI display',
    },
  }, {
    tableName: 'gas_types',
    underscored: true,
    timestamps: true,
  });

  return GasType;
};
