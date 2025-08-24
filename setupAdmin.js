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

const setupAdmin = async () => {
  try {
    const adminData = {
      displayName: 'Super Admin',
      email: 'admin@indigorhapsody.com',
      phoneNumber: '+1234567890',
      password: 'AdminPassword123!',
      role: 'Admin',
      is_creator: false,
    };

    console.log('🔧 Setting up admin user...');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('👤 Display Name:', existingAdmin.displayName);
      console.log('📧 Email:', existingAdmin.email);
      console.log('👑 Role:', existingAdmin.role);
      console.log('🔐 Has Password:', !!existingAdmin.password);
      console.log('');

      // Test password validation
      if (existingAdmin.password) {
        console.log('🔐 Testing password validation...');
        const isPasswordValid = await bcrypt.compare(adminData.password, existingAdmin.password);
        
        if (isPasswordValid) {
          console.log('✅ Password is valid!');
          console.log('');
          console.log('🚀 You can now login using:');
          console.log('POST /api/auth/admin-login');
          console.log('Body: { "email": "' + adminData.email + '", "password": "' + adminData.password + '" }');
        } else {
          console.log('❌ Password is invalid!');
          console.log('💡 The admin user was created with a different password.');
          console.log('');
          console.log('🔄 Updating password...');
          
          // Update password
          const saltRounds = 12;
          const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
          existingAdmin.password = hashedPassword;
          await existingAdmin.save();
          
          console.log('✅ Password updated successfully!');
          console.log('');
          console.log('🚀 You can now login using:');
          console.log('POST /api/auth/admin-login');
          console.log('Body: { "email": "' + adminData.email + '", "password": "' + adminData.password + '" }');
        }
      } else {
        console.log('❌ Admin user has no password!');
        console.log('🔄 Adding password...');
        
        // Add password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
        existingAdmin.password = hashedPassword;
        await existingAdmin.save();
        
        console.log('✅ Password added successfully!');
        console.log('');
        console.log('🚀 You can now login using:');
        console.log('POST /api/auth/admin-login');
        console.log('Body: { "email": "' + adminData.email + '", "password": "' + adminData.password + '" }');
      }
      return;
    }

    // Create new admin user
    console.log('🆕 Creating new admin user...');
    
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
    console.log('👤 Display Name:', newAdmin.displayName);
    console.log('📧 Email:', newAdmin.email);
    console.log('👑 Role:', newAdmin.role);
    console.log('');
    console.log('🚀 You can now login using:');
    console.log('POST /api/auth/admin-login');
    console.log('Body: { "email": "' + adminData.email + '", "password": "' + adminData.password + '" }');

  } catch (error) {
    console.error('❌ Error setting up admin:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Run the setup
setupAdmin();
