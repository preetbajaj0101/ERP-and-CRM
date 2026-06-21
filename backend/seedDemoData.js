/**
 * Seed script — inserts realistic demo transactions for the last 7 days
 * so the dashboard charts look attractive.
 *
 * Run:  node seedDemoData.js
 */
require('dotenv').config();
const { connectDB, Customer, Vendor, User, Transaction, Inventory, Cylinder, GasType } = require('./models');

async function seed() {
  await connectDB();
  console.log('✅ DB connected');

  // ── Get or create prerequisite records ─────────────────
  let user = await User.findOne();
  if (!user) {
    console.log('⚠ No user found — cannot seed (login first to create a user)');
    process.exit(1);
  }

  // Ensure we have a few customers
  const customerNames = [
    { name: 'Singh Manufacturing', phone: '9876500001', address: 'Industrial Area, Ludhiana' },
    { name: 'Punjab Steel Fabricators', phone: '9876500002', address: 'GT Road, Jalandhar' },
    { name: 'Gupta Welding Works', phone: '9876500003', address: 'Focal Point, Amritsar' },
    { name: 'Sharma Auto Garage', phone: '9876500004', address: 'Bypass Road, Patiala' },
    { name: 'Khalsa Engineering', phone: '9876500005', address: 'Phase 5, Mohali' },
  ];
  for (const c of customerNames) {
    const exists = await Customer.findOne({ phone: c.phone });
    if (!exists) await Customer.create(c);
  }
  const customers = await Customer.find();

  // Ensure we have vendors
  const vendorNames = [
    { name: 'Industrial Gas Suppliers', phone: '9876600001', address: 'Rajpura' },
    { name: 'National Welding Co.', phone: '9876600002', address: 'Chandigarh' },
  ];
  for (const v of vendorNames) {
    const exists = await Vendor.findOne({ phone: v.phone });
    if (!exists) await Vendor.create(v);
  }
  const vendors = await Vendor.find();

  // Ensure gas types exist
  const gasTypeData = [
    { name: 'Oxygen', formula: 'O₂', color: '#3b82f6', basePrice: 250 },
    { name: 'CO2', formula: 'CO₂', color: '#8b5cf6', basePrice: 300 },
    { name: 'Argon', formula: 'Ar', color: '#06b6d4', basePrice: 800 },
    { name: 'Nitrogen', formula: 'N₂', color: '#10b981', basePrice: 200 },
    { name: 'Acetylene', formula: 'C₂H₂', color: '#f59e0b', basePrice: 400 },
  ];
  for (const g of gasTypeData) {
    const exists = await GasType.findOne({ name: g.name });
    if (!exists) await GasType.create(g);
  }
  const gasTypes = await GasType.find();

  // Ensure inventory items
  const invItems = [
    { itemName: 'Oxygen Cylinder (Medium)', itemType: 'gas_cylinder', gasTypeId: gasTypes.find(g => g.name === 'Oxygen')?._id, quantityFull: 45, quantityEmpty: 12, reorderLevel: 10, unitPrice: 250 },
    { itemName: 'CO2 Cylinder (Medium)', itemType: 'gas_cylinder', gasTypeId: gasTypes.find(g => g.name === 'CO2')?._id, quantityFull: 30, quantityEmpty: 8, reorderLevel: 8, unitPrice: 300 },
    { itemName: 'Argon Cylinder (Large)', itemType: 'gas_cylinder', gasTypeId: gasTypes.find(g => g.name === 'Argon')?._id, quantityFull: 15, quantityEmpty: 5, reorderLevel: 5, unitPrice: 800 },
    { itemName: 'Nitrogen Cylinder (Medium)', itemType: 'gas_cylinder', gasTypeId: gasTypes.find(g => g.name === 'Nitrogen')?._id, quantityFull: 25, quantityEmpty: 10, reorderLevel: 8, unitPrice: 200 },
    { itemName: 'Welding Torch Set', itemType: 'equipment', quantityTotal: 8, reorderLevel: 2, unitPrice: 4500 },
    { itemName: 'Welding Rod (Pack of 50)', itemType: 'welding_accessory', quantityTotal: 200, reorderLevel: 30, unitPrice: 450 },
    { itemName: 'Gas Regulator (O2)', itemType: 'equipment', quantityTotal: 15, reorderLevel: 3, unitPrice: 2500 },
  ];
  for (const inv of invItems) {
    const exists = await Inventory.findOne({ itemName: inv.itemName });
    if (!exists) await Inventory.create(inv);
  }

  // Ensure cylinders
  const cylinderData = [
    { serialNumber: 'DG-O2-001', size: 'medium', status: 'full' },
    { serialNumber: 'DG-O2-002', size: 'large', status: 'with_customer' },
    { serialNumber: 'DG-O2-003', size: 'medium', status: 'empty' },
    { serialNumber: 'DG-CO2-001', size: 'medium', status: 'full' },
    { serialNumber: 'DG-CO2-002', size: 'medium', status: 'in_refill' },
    { serialNumber: 'DG-AR-001', size: 'large', status: 'full' },
    { serialNumber: 'DG-N2-001', size: 'medium', status: 'full' },
    { serialNumber: 'DG-N2-002', size: 'large', status: 'empty' },
    { serialNumber: 'DG-C2H2-001', size: 'small', status: 'full' },
    { serialNumber: 'DG-O2-004', size: 'jumbo', status: 'full' },
    { serialNumber: 'DG-O2-005', size: 'medium', status: 'with_customer' },
    { serialNumber: 'DG-CO2-003', size: 'large', status: 'full' },
    { serialNumber: 'DG-AR-002', size: 'medium', status: 'in_refill' },
    { serialNumber: 'DG-O2-006', size: 'medium', status: 'damaged' },
  ];
  for (const cyl of cylinderData) {
    const exists = await Cylinder.findOne({ serialNumber: cyl.serialNumber });
    if (!exists) {
      const prefix = cyl.serialNumber.split('-')[1];
      const gasMap = { O2: 'Oxygen', CO2: 'CO2', AR: 'Argon', N2: 'Nitrogen', C2H2: 'Acetylene' };
      const gt = gasTypes.find(g => g.name === gasMap[prefix]);
      await Cylinder.create({ ...cyl, gasTypeId: gt?._id, depositAmount: Math.floor(Math.random() * 5000) + 3000 });
    }
  }

  // Assign some cylinders to customers
  const cyl002 = await Cylinder.findOne({ serialNumber: 'DG-O2-002' });
  if (cyl002) await Cylinder.findByIdAndUpdate(cyl002._id, { currentHolderId: customers[0]?._id });
  const cyl005 = await Cylinder.findOne({ serialNumber: 'DG-O2-005' });
  if (cyl005) await Cylinder.findByIdAndUpdate(cyl005._id, { currentHolderId: customers[1]?._id });

  // ── Seed sales transactions for last 7 days ────────────
  const today = new Date();
  const paymentMethods = ['cash', 'upi', 'bank_transfer', 'credit'];

  const dailySalesConfig = [
    { dayOffset: 6, minTxns: 3, maxTxns: 5, minAmt: 1500, maxAmt: 12000 },
    { dayOffset: 5, minTxns: 4, maxTxns: 7, minAmt: 2000, maxAmt: 15000 },
    { dayOffset: 4, minTxns: 5, maxTxns: 8, minAmt: 2500, maxAmt: 18000 },
    { dayOffset: 3, minTxns: 3, maxTxns: 6, minAmt: 1800, maxAmt: 14000 },
    { dayOffset: 2, minTxns: 6, maxTxns: 9, minAmt: 3000, maxAmt: 20000 },
    { dayOffset: 1, minTxns: 5, maxTxns: 8, minAmt: 2500, maxAmt: 16000 },
    { dayOffset: 0, minTxns: 4, maxTxns: 7, minAmt: 2000, maxAmt: 15000 },
  ];

  let totalSeeded = 0;

  for (const dayConf of dailySalesConfig) {
    const txnDate = new Date(today);
    txnDate.setDate(txnDate.getDate() - dayConf.dayOffset);
    txnDate.setHours(9, 0, 0, 0);

    const numTxns = dayConf.minTxns + Math.floor(Math.random() * (dayConf.maxTxns - dayConf.minTxns + 1));

    for (let t = 0; t < numTxns; t++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const amount = dayConf.minAmt + Math.floor(Math.random() * (dayConf.maxAmt - dayConf.minAmt));
      const tax = Math.round(amount * 0.18);
      const grandTotal = amount + tax;
      const isPaid = Math.random() > 0.25;
      const paidAmount = isPaid ? grandTotal : Math.floor(grandTotal * Math.random() * 0.7);

      const txnTime = new Date(txnDate);
      txnTime.setHours(9 + Math.floor(Math.random() * 9));
      txnTime.setMinutes(Math.floor(Math.random() * 60));

      const txnDoc = new Transaction({
        type: 'sale',
        customerId: customer._id,
        createdBy: user._id,
        totalAmount: amount,
        taxAmount: tax,
        discountAmount: 0,
        grandTotal,
        paidAmount,
        paymentStatus: paidAmount >= grandTotal ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid',
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        notes: 'Demo sale transaction',
      });
      txnDoc.createdAt = txnTime;
      txnDoc.updatedAt = txnTime;
      await txnDoc.save({ timestamps: false });
      totalSeeded++;
    }
  }

  // ── Seed a few purchase transactions too ───────────────
  for (let i = 0; i < 4; i++) {
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    const amount = 15000 + Math.floor(Math.random() * 40000);
    const tax = Math.round(amount * 0.18);
    const grandTotal = amount + tax;
    const txnDate = new Date(today);
    txnDate.setDate(txnDate.getDate() - Math.floor(Math.random() * 7));
    txnDate.setHours(10 + Math.floor(Math.random() * 6));

    const txnDoc = new Transaction({
      type: 'purchase',
      vendorId: vendor._id,
      createdBy: user._id,
      totalAmount: amount,
      taxAmount: tax,
      grandTotal,
      paidAmount: grandTotal,
      paymentStatus: 'paid',
      paymentMethod: 'bank_transfer',
      notes: 'Demo purchase transaction',
    });
    txnDoc.createdAt = txnDate;
    txnDoc.updatedAt = txnDate;
    await txnDoc.save({ timestamps: false });
  }

  console.log(`\n🎉 Seeded ${totalSeeded} sale transactions across 7 days`);
  console.log(`🎉 Seeded 4 purchase transactions`);
  console.log(`🎉 Seeded ${customerNames.length} customers, ${vendorNames.length} vendors`);
  console.log(`🎉 Seeded ${gasTypeData.length} gas types, ${cylinderData.length} cylinders`);
  console.log(`🎉 Seeded ${invItems.length} inventory items`);
  console.log('\n✅ All done! Restart the backend server to see the updated dashboard.');

  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
