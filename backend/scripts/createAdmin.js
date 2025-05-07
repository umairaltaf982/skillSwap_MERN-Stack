const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@skillswap.com' });

    if (adminExists) {
      console.log('Admin user already exists, deleting it to create a new one');
      await User.deleteOne({ email: 'admin@skillswap.com' });
    }

    // Hash password - using a simple password for testing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    console.log('Hashed password:', hashedPassword);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@skillswap.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    console.log('Admin user created successfully:');
    console.log(`Name: ${admin.name}`);
    console.log(`Email: admin@skillswap.com`);
    console.log(`Password: admin123`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
