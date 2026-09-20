const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Settings = require('./models/Settings');

const seedAdminOnly = async () => {
  try {
    await connectDB();
    console.log('\n👑 Seeding Admin Account for Dajiraj Dairy & Farm...\n');

    // Check if an admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log(`ℹ️  Admin already exists: ${existingAdmin.email} (Phone: ${existingAdmin.phone})`);
      console.log('   No changes were made.');
    } else {
      const email = process.env.ADMIN_EMAIL || 'admin@dajiraj.com';
      const phone = process.env.ADMIN_PHONE || '9876543210';
      const password = process.env.ADMIN_PASSWORD || 'admin123';

      const admin = await User.create({
        name: 'Super Admin',
        email: email.toLowerCase(),
        phone,
        passwordHash: password,
        role: 'admin',
        active: true,
      });

      console.log('✅ Admin created successfully:');
      console.log(`   Email:    ${admin.email}`);
      console.log(`   Phone:    ${admin.phone}`);
      console.log(`   Password: ${password}`);
    }

    // Ensure default business settings exist
    await Settings.getSettings();
    console.log('✅ System settings verified.');

    console.log('\n🎉 Setup complete. You can now log in to the admin panel.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
};

seedAdminOnly();
