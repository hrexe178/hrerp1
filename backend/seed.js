require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@hrerp.com' });
    if (adminExists) {
      console.log('✅ Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
      lastName: process.env.ADMIN_LAST_NAME || 'User',
      email: process.env.ADMIN_EMAIL || 'admin@hrerp.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      isActive: true,
    });

    console.log('✅ Admin user created successfully');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔐 Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log('⚠️  Please change the password after first login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
