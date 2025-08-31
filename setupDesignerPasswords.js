const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./src/models/userModel');
const Designer = require('./src/models/designerModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/indigo_rhapsody')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const setupDesignerPasswords = async () => {
  try {
    console.log('🔧 Setting up passwords for existing designers...\n');

    // Find all users with Designer role
    const designerUsers = await User.find({ role: 'Designer' }).populate('designerRef');
    
    if (designerUsers.length === 0) {
      console.log('❌ No designer users found in the database.');
      return;
    }

    console.log(`📊 Found ${designerUsers.length} designer users:\n`);

    for (const user of designerUsers) {
      console.log(`👤 Designer: ${user.displayName} (${user.email})`);
      
      // Check if user already has a password
      if (user.password) {
        console.log(`   ✅ Already has password set`);
        continue;
      }

      // Generate a default password based on email or phone
      const defaultPassword = user.email ? 
        user.email.split('@')[0] + '123' : 
        user.phoneNumber.slice(-4) + '123';
      
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
      
      // Update user with hashed password
      await User.findByIdAndUpdate(user._id, {
        password: hashedPassword
      });

      console.log(`   🔑 Password set: ${defaultPassword}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   📱 Phone: ${user.phoneNumber}`);
      
      // Check if designer profile exists
      const designer = await Designer.findOne({ userId: user._id });
      if (designer) {
        console.log(`   🎨 Designer Profile: ${designer.is_approved ? '✅ Approved' : '⏳ Pending Approval'}`);
      } else {
        console.log(`   ⚠️  No designer profile found`);
      }
      console.log('');
    }

    console.log('🎯 Setup Summary:');
    console.log('=================');
    console.log(`• Total designers: ${designerUsers.length}`);
    console.log(`• Passwords updated: ${designerUsers.filter(u => !u.password).length}`);
    console.log('');
    console.log('💡 Login Instructions:');
    console.log('=====================');
    console.log('• Use the email and generated password to login');
    console.log('• Default password format: email_prefix123 or last4digits123');
    console.log('• Example: if email is john@example.com, password is john123');
    console.log('• Example: if phone is +919876543210, password is 3210123');
    console.log('');
    console.log('🔐 Security Note:');
    console.log('================');
    console.log('• Change passwords after first login for security');
    console.log('• Store passwords securely and share with designers privately');

  } catch (error) {
    console.error('❌ Error setting up designer passwords:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the setup
setupDesignerPasswords();
