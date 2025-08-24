const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./src/models/userModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/indigo_rhapsody', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createAdminUser = async () => {
  try {
    const adminData = {
      displayName: 'Super Admin',
      email: 'admin@indigorhapsody.com',
      phoneNumber: '+1234567890', // Replace with your actual phone number
      password: 'AdminPassword123!', // Replace with your desired password
      role: 'Admin',
      is_creator: false,
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

    // Create admin user
    const newAdmin = new User({
      ...adminData,
      password: hashedPassword,
    });

    await newAdmin.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Role:', adminData.role);
    console.log('\n🚀 You can now login using the admin-login endpoint:');
    console.log('POST /api/auth/admin-login');
    console.log('Body: { "email": "' + adminData.email + '", "password": "' + adminData.password + '" }');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
createAdminUser();
