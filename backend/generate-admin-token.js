require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./src/models/User'); // Adjust path based on execution dir

async function generateTestAdminToken() {
  try {
    // The docker backend uses the local MongoDB container, so we must insert the user there.
    await mongoose.connect('mongodb://admin:admin123@localhost:27017/mall_db?authSource=admin');

    // Find an existing admin user
    let admin = await User.findOne({ role: 'admin' });

    if (!admin) {
      console.log('No admin found, creating a test admin...');
      admin = new User({
        lastname: 'Admin',
        firstname: 'Test',
        email: 'admin@test.com',
        password: 'password123', // Raw password, assuming pre-save hook hashes it if using bcrypt
        role: 'admin',
        isActive: true,
      });
      await admin.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id }, 'votre-secret-jwt-super-securise-changez-moi', {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });

    console.log('\n--- BROWSER CONSOLE COMMAND ---');
    console.log(`localStorage.setItem('token', '${token}');`);
    console.log(`localStorage.setItem('currentUser', JSON.stringify(${JSON.stringify(admin)}));`);
    console.log('-------------------------------\n');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

generateTestAdminToken();
