const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Product = require('./models/Product');
const Settings = require('./models/Settings');
const Delivery = require('./models/Delivery');
const Counter = require('./models/Counter');
const { startOfDay, subDays, format } = require('date-fns');

const seedData = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Seeding Dajiraj Dairy & Farm database...\n');

    // Clear existing data
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Product.deleteMany({});
    await Settings.deleteMany({});
    await Delivery.deleteMany({});
    await Counter.deleteMany({});

    // Create Admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@dajiraj.com',
      phone: '9876543210',
      passwordHash: 'admin123',
      role: 'admin',
      active: true,
    });
    console.log('✅ Admin created: admin@dajiraj.com / admin123');

    // Create Staff
    const staff1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@dajiraj.com',
      phone: '9876543211',
      passwordHash: 'staff123',
      role: 'staff',
      permissions: { customers: true, deliveries: true, stock: true, invoices: true, inquiries: true },
      active: true,
    });

    const staff2 = await User.create({
      name: 'Suresh Patel',
      email: 'suresh@dajiraj.com',
      phone: '9876543212',
      passwordHash: 'staff123',
      role: 'staff',
      permissions: { customers: true, deliveries: true, stock: false, invoices: false, inquiries: true },
      active: true,
    });
    console.log('✅ Staff created: rajesh@dajiraj.com / staff123, suresh@dajiraj.com / staff123');

    // Create Delivery Boys
    const delivery1 = await User.create({
      name: 'Ramesh Singh',
      email: 'ramesh@dajiraj.com',
      phone: '9876543213',
      passwordHash: 'delivery123',
      role: 'delivery',
      assignedArea: 'Area A - North Zone',
      vehicleInfo: 'Bike - MH01AB1234',
      active: true,
    });

    const delivery2 = await User.create({
      name: 'Ganesh Yadav',
      email: 'ganesh@dajiraj.com',
      phone: '9876543214',
      passwordHash: 'delivery123',
      role: 'delivery',
      assignedArea: 'Area B - South Zone',
      vehicleInfo: 'Bike - MH01CD5678',
      active: true,
    });
    console.log('✅ Delivery Boys created: ramesh@dajiraj.com / delivery123, ganesh@dajiraj.com / delivery123');

    // Create Customers
    const customerData = [
      { name: 'Priya Sharma', email: 'priya@example.com', phone: '9812345601', address: '123 MG Road, Sector 5', dailyMilkQuantityMl: 1000, milkRate: 60, deliveryOrder: 1 },
      { name: 'Amit Verma', email: 'amit@example.com', phone: '9812345602', address: '456 Gandhi Nagar, Block B', dailyMilkQuantityMl: 1500, milkRate: 60, deliveryOrder: 2 },
      { name: 'Sunita Devi', email: 'sunita@example.com', phone: '9812345603', address: '789 Nehru Colony, Lane 3', dailyMilkQuantityMl: 2000, milkRate: 58, deliveryOrder: 3 },
      { name: 'Vikram Joshi', email: 'vikram@example.com', phone: '9812345604', address: '321 Patel Nagar, House 45', dailyMilkQuantityMl: 1000, milkRate: 60, deliveryOrder: 4 },
      { name: 'Meera Gupta', email: 'meera@example.com', phone: '9812345605', address: '654 Shastri Bhawan, Flat 12', dailyMilkQuantityMl: 750, milkRate: 62, deliveryOrder: 5 },
      { name: 'Ravi Tiwari', email: '', phone: '9812345606', address: '987 Sadar Bazaar, Shop 8', dailyMilkQuantityMl: 1250, milkRate: 60, deliveryOrder: 1 },
      { name: 'Kavita Mishra', email: 'kavita@example.com', phone: '9812345607', address: '147 Civil Lines, Bungalow 3', dailyMilkQuantityMl: 2000, milkRate: 58, deliveryOrder: 2 },
      { name: 'Deepak Rana', email: '', phone: '9812345608', address: '258 Station Road, Near Temple', dailyMilkQuantityMl: 500, milkRate: 65, deliveryOrder: 3 },
      { name: 'Anita Chauhan', email: 'anita@example.com', phone: '9812345609', address: '369 New Market, Above Bank', dailyMilkQuantityMl: 1000, milkRate: 60, deliveryOrder: 4 },
      { name: 'Sanjay Pandey', email: 'sanjay@example.com', phone: '9812345610', address: '741 Old City, Mohalla 6', dailyMilkQuantityMl: 1500, milkRate: 60, deliveryOrder: 5 },
    ];

    const customers = [];
    for (let i = 0; i < customerData.length; i++) {
      const isGroupA = i < 5;
      const customer = await Customer.create({
        ...customerData[i],
        assignedStaff: isGroupA ? staff1._id : staff2._id,
        assignedDeliveryBoy: isGroupA ? delivery1._id : delivery2._id,
        googleMapsLink: 'https://maps.google.com/?q=28.6139,77.2090',
      });
      customers.push(customer);
    }
    console.log(`✅ ${customers.length} Customers created`);

    // Create Products
    const products = await Product.insertMany([
      { name: 'Fresh Cow Milk', sku: 'MILK-COW', category: 'Milk', description: 'Pure and fresh cow milk delivered daily from our farm.', unit: 'litre', sellingPrice: 60, purchasePrice: 40, currentStock: 100, minimumStock: 20, displayOrder: 1, imageUrl: '' },
      { name: 'Buffalo Milk', sku: 'MILK-BUF', category: 'Milk', description: 'Rich and creamy buffalo milk, high in fat content.', unit: 'litre', sellingPrice: 70, purchasePrice: 50, currentStock: 80, minimumStock: 15, displayOrder: 2, imageUrl: '' },
      { name: 'Fresh Curd', sku: 'CURD-01', category: 'Curd', description: 'Thick and creamy homemade curd.', unit: 'kg', sellingPrice: 80, purchasePrice: 50, currentStock: 30, minimumStock: 10, displayOrder: 3, imageUrl: '' },
      { name: 'Buttermilk', sku: 'BMLK-01', category: 'Buttermilk', description: 'Refreshing traditional buttermilk.', unit: 'litre', sellingPrice: 40, purchasePrice: 20, currentStock: 25, minimumStock: 10, displayOrder: 4, imageUrl: '' },
      { name: 'Fresh Paneer', sku: 'PNR-01', category: 'Paneer', description: 'Soft and fresh homemade paneer.', unit: 'kg', sellingPrice: 320, purchasePrice: 200, currentStock: 15, minimumStock: 5, displayOrder: 5, imageUrl: '' },
      { name: 'Pure Desi Ghee', sku: 'GHEE-01', category: 'Ghee', description: 'Traditional desi ghee made from pure cow milk.', unit: 'kg', sellingPrice: 600, purchasePrice: 400, currentStock: 8, minimumStock: 3, displayOrder: 6, imageUrl: '' },
    ]);
    console.log(`✅ ${products.length} Products created`);

    // Create sample delivery records for the past 7 days
    const today = new Date();
    let deliveryCount = 0;

    for (let dayOffset = 7; dayOffset >= 1; dayOffset--) {
      const deliveryDate = startOfDay(subDays(today, dayOffset));

      for (const customer of customers) {
        // Random adjustment
        const adjustments = [-250, 0, 0, 0, 250, 0, 0]; // mostly no adjustment
        const randomAdj = adjustments[Math.floor(Math.random() * adjustments.length)];
        const finalQty = Math.max(0, customer.dailyMilkQuantityMl + randomAdj);

        try {
          await Delivery.create({
            customer: customer._id,
            deliveryBoy: customer.assignedDeliveryBoy,
            staff: customer.assignedStaff,
            date: deliveryDate,
            baseQuantityMl: customer.dailyMilkQuantityMl,
            adjustmentMl: randomAdj,
            finalQuantityMl: finalQty,
            milkRate: customer.milkRate,
            status: 'Delivered',
            deliveredAt: new Date(deliveryDate.getTime() + 7 * 60 * 60 * 1000), // 7 AM
          });
          deliveryCount++;
        } catch (e) {
          // Skip duplicates
        }
      }
    }
    console.log(`✅ ${deliveryCount} Delivery records created`);

    // Create Settings
    await Settings.create({
      businessName: 'DAJIRAJ DAIRY & FARM',
      tagline: 'Milking with Care',
      secondaryTagline: 'Farming with Love',
      phone: '9876543210',
      email: 'info@dajirajdairy.com',
      address: 'Village Road, Near Farm, District Center',
      googleMapsLink: 'https://maps.google.com/?q=28.6139,77.2090',
      businessHours: 'Mon-Sat: 6:00 AM - 8:00 PM, Sun: 6:00 AM - 12:00 PM',
      defaultMilkRate: 60,
      invoicePrefix: 'DDF',
      deliveryAdjustmentMl: 250,
    });
    console.log('✅ Settings created');

    console.log('\n🎉 Seed complete!\n');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│  Login Credentials (Development Only)       │');
    console.log('├─────────────────────────────────────────────┤');
    console.log('│  Admin:        admin@dajiraj.com / admin123 │');
    console.log('│  Staff 1:      rajesh@dajiraj.com / staff123│');
    console.log('│  Staff 2:      suresh@dajiraj.com / staff123│');
    console.log('│  Delivery 1:   ramesh@dajiraj.com /delivery123│');
    console.log('│  Delivery 2:   ganesh@dajiraj.com /delivery123│');
    console.log('└─────────────────────────────────────────────┘\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
