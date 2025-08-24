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

const testAdminLogin = async () => {
  try {
    const testEmail = 'admin@indigorhapsody.com';
    const testPassword = 'AdminPassword123!';

    console.log('🔍 Testing admin login...');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Password:', testPassword);
    console.log('');

    // Step 1: Check if admin user exists
    const user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('❌ Admin user not found!');
      console.log('💡 Run "node createAdmin.js" first to create the admin user.');
      return;
    }

    console.log('✅ Admin user found!');
    console.log('👤 Display Name:', user.displayName);
    console.log('📧 Email:', user.email);
    console.log('👑 Role:', user.role);
    console.log('🔐 Has Password:', !!user.password);
    console.log('');

    // Step 2: Check if user has password
    if (!user.password) {
      console.log('❌ Admin user has no password set!');
      console.log('💡 The admin user needs a password to login.');
      return;
    }

    // Step 3: Test password validation
    console.log('🔐 Testing password validation...');
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    
    if (isPasswordValid) {
      console.log('✅ Password is valid!');
      console.log('');
      console.log('🚀 Admin login should work with:');
      console.log('POST /api/users/adminLogin');
      console.log('Body: { "email": "' + testEmail + '", "password": "' + testPassword + '" }');
    } else {
      console.log('❌ Password is invalid!');
      console.log('');
      console.log('💡 Possible issues:');
      console.log('1. The password in createAdmin.js doesn\'t match what you\'re testing');
      console.log('2. The admin user was created with a different password');
      console.log('3. Run "node createAdmin.js" again to recreate the admin user');
    }

  } catch (error) {
    console.error('❌ Error testing admin login:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Run the test
testAdminLogin();
