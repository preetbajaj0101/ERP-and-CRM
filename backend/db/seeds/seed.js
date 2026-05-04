const bcrypt = require('bcryptjs');
const db = require('../../models');

const seedDatabase = async () => {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync({ force: true });
    console.log('Database synced (force)');

    // Admin user
    const passwordHash = await bcrypt.hash('admin123', 12);
    const admin = await db.User.create({
      name: 'Dashmesh Admin',
      email: 'admin@dashmeshgases.com',
      passwordHash,
      role: 'admin',
    });

    // Purchaser user
    await db.User.create({
      name: 'Staff User',
      email: 'staff@dashmeshgases.com',
      passwordHash: await bcrypt.hash('staff123', 12),
      role: 'purchaser',
    });

    // Gas Types
    const oxygen = await db.GasType.create({ name: 'Oxygen', formula: 'O2', unit: 'cylinder', basePrice: 250, color: '#3b82f6' });
    const co2 = await db.GasType.create({ name: 'Carbon Dioxide', formula: 'CO2', unit: 'cylinder', basePrice: 300, color: '#8b5cf6' });
    const argon = await db.GasType.create({ name: 'Argon', formula: 'Ar', unit: 'cylinder', basePrice: 800, color: '#06b6d4' });
    const nitrogen = await db.GasType.create({ name: 'Nitrogen', formula: 'N2', unit: 'cylinder', basePrice: 200, color: '#10b981' });
    const acetylene = await db.GasType.create({ name: 'Acetylene', formula: 'C2H2', unit: 'cylinder', basePrice: 1200, color: '#f59e0b' });

    // Inventory items
    const invO2 = await db.Inventory.create({ gasTypeId: oxygen.id, itemName: 'Oxygen Cylinder (Medium)', itemType: 'gas_cylinder', quantityFull: 45, quantityEmpty: 12, reorderLevel: 10, unitPrice: 250, costPrice: 150 });
    const invCO2 = await db.Inventory.create({ gasTypeId: co2.id, itemName: 'CO2 Cylinder (Medium)', itemType: 'gas_cylinder', quantityFull: 30, quantityEmpty: 8, reorderLevel: 8, unitPrice: 300, costPrice: 180 });
    const invAr = await db.Inventory.create({ gasTypeId: argon.id, itemName: 'Argon Cylinder (Large)', itemType: 'gas_cylinder', quantityFull: 15, quantityEmpty: 5, reorderLevel: 5, unitPrice: 800, costPrice: 500 });
    const invN2 = await db.Inventory.create({ gasTypeId: nitrogen.id, itemName: 'Nitrogen Cylinder (Medium)', itemType: 'gas_cylinder', quantityFull: 25, quantityEmpty: 10, reorderLevel: 8, unitPrice: 200, costPrice: 120 });
    await db.Inventory.create({ itemName: 'Welding Rod (Pack of 50)', itemType: 'welding_accessory', quantityTotal: 200, reorderLevel: 30, unitPrice: 450, costPrice: 300 });
    await db.Inventory.create({ itemName: 'Gas Regulator (O2)', itemType: 'equipment', quantityTotal: 15, reorderLevel: 3, unitPrice: 2500, costPrice: 1800 });
    await db.Inventory.create({ itemName: 'Welding Torch Set', itemType: 'equipment', quantityTotal: 8, reorderLevel: 2, unitPrice: 4500, costPrice: 3200 });

    // Cylinders with serial numbers
    const cylinderData = [
      { gasTypeId: oxygen.id, serialNumber: 'DG-O2-001', status: 'full', size: 'medium', purchaseCost: 8000, depositAmount: 5000 },
      { gasTypeId: oxygen.id, serialNumber: 'DG-O2-002', status: 'full', size: 'large', purchaseCost: 12000, depositAmount: 8000 },
      { gasTypeId: oxygen.id, serialNumber: 'DG-O2-003', status: 'empty', size: 'medium', purchaseCost: 8000, depositAmount: 5000 },
      { gasTypeId: co2.id, serialNumber: 'DG-CO2-001', status: 'full', size: 'medium', purchaseCost: 9000, depositAmount: 6000 },
      { gasTypeId: co2.id, serialNumber: 'DG-CO2-002', status: 'in_refill', size: 'medium', purchaseCost: 9000, depositAmount: 6000 },
      { gasTypeId: argon.id, serialNumber: 'DG-AR-001', status: 'full', size: 'large', purchaseCost: 15000, depositAmount: 10000 },
      { gasTypeId: nitrogen.id, serialNumber: 'DG-N2-001', status: 'full', size: 'medium', purchaseCost: 7000, depositAmount: 4000 },
      { gasTypeId: acetylene.id, serialNumber: 'DG-C2H2-001', status: 'full', size: 'small', purchaseCost: 18000, depositAmount: 12000 },
    ];
    for (const cyl of cylinderData) {
      await db.Cylinder.create(cyl);
    }

    // Customers
    const cust1 = await db.Customer.create({ name: 'Singh Manufacturing', phone: '9876543210', email: 'singh.mfg@email.com', address: '123 Industrial Area, Ludhiana', gstNumber: '03AAACS1234F1Z5', creditLimit: 50000 });
    const cust2 = await db.Customer.create({ name: 'Kaur Welding Works', phone: '9876543211', address: '45 Gill Road, Ludhiana', creditLimit: 30000 });
    const cust3 = await db.Customer.create({ name: 'Punjab Steel Fabricators', phone: '9876543212', email: 'punjab.steel@email.com', address: '78 Focal Point, Ludhiana', gstNumber: '03AABCP5678G1Z9', creditLimit: 100000 });

    // Vendors
    const vend1 = await db.Vendor.create({ name: 'National Gas Suppliers', phone: '9812345670', email: 'national.gas@email.com', address: 'Gas Plant Road, Chandigarh', gstNumber: '04AABCN1234H1Z2' });
    await db.Vendor.create({ name: 'Indo Welding Supplies', phone: '9812345671', address: 'Industrial Zone, Delhi' });

    // Sample transactions
    const sale1 = await db.Transaction.create({
      type: 'sale', customerId: cust1.id, createdBy: admin.id,
      totalAmount: 2500, taxAmount: 450, discountAmount: 0, grandTotal: 2950,
      paidAmount: 2000, paymentStatus: 'partial', paymentMethod: 'upi', notes: 'Monthly gas supply',
    });
    await db.TransactionItem.create({ transactionId: sale1.id, inventoryId: invO2.id, quantity: 10, unitPrice: 250, totalPrice: 2500 });
    await db.LedgerEntry.create({ customerId: cust1.id, transactionId: sale1.id, entryType: 'debit', amount: 2950, runningBalance: 2950, description: 'Sale - 10x Oxygen Cylinders' });
    await db.LedgerEntry.create({ customerId: cust1.id, transactionId: sale1.id, entryType: 'credit', amount: 2000, runningBalance: 950, description: 'Payment received (UPI)' });
    await cust1.update({ currentBalance: 950 });

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@dashmeshgases.com / admin123');
    console.log('   Staff: staff@dashmeshgases.com / staff123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
