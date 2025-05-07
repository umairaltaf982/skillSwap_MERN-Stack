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

const testPassword = async () => {
  try {
    // Find admin user
    const admin = await User.findOne({ email: 'admin@skillswap.com' }).select('+password');
    
    if (!admin) {
      console.log('Admin user not found');
      process.exit(1);
    }
    
    console.log('Admin user found:');
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Password hash: ${admin.password}`);
    
    // Test password
    const testPass = 'admin123';
    console.log(`Testing password: ${testPass}`);
    
    // Test with bcrypt directly
    const isMatch = await bcrypt.compare(testPass, admin.password);
    console.log(`Password match result: ${isMatch}`);
    
    // Test with User model method
    const isMatchModel = await admin.matchPassword(testPass);
    console.log(`Password match using model method: ${isMatchModel}`);
    
    // Create a new hash for comparison
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(testPass, salt);
    console.log(`New hash for same password: ${newHash}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing password:', error);
    process.exit(1);
  }
};

testPassword();
