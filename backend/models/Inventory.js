const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Inventory = sequelize.define('Inventory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    gasTypeId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'gas_type_id',
    },
    itemName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'item_name',
    },
    itemType: {
      type: DataTypes.ENUM('gas_cylinder', 'welding_accessory', 'equipment', 'consumable'),
      allowNull: false,
      field: 'item_type',
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    quantityFull: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'quantity_full',
      comment: 'Full/ready stock count',
    },
    quantityEmpty: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'quantity_empty',
      comment: 'Empty cylinders awaiting refill',
    },
    quantityTotal: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'quantity_total',
      comment: 'For non-cylinder items, total stock',
    },
    reorderLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      field: 'reorder_level',
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'unit_price',
    },
    costPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'cost_price',
    },
  }, {
    tableName: 'inventory',
    underscored: true,
    timestamps: true,
  });

  return Inventory;
};
