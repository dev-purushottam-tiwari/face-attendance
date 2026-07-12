require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

(async () => {
  await connectDB();
  const email = process.env.ADMIN_EMAIL
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({
      name: 'System Admin',
      employeeId: 'ADMIN001',
      email,
      password: 'Admin@123',
      department: 'Management',
      designation: 'Administrator',
      role: 'admin',
      isApproved: true,
      faceStatus: 'approved',
    });
    console.log('✅ Admin created:', email, '/ Admin@123');
  } else {
    console.log('ℹ️ Admin already exists');
  }
  process.exit(0);
})();