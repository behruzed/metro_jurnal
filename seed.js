const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Station = require('./models/Station');
const Device = require('./models/Device');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jurnal-uzmetro';

const initDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for initialization...');

    // Clear existing data (optional, but good for clean start)
    await User.deleteMany({});
    await Station.deleteMany({});
    await Device.deleteMany({});

    // Create Superadmin
    const superadmin = await User.create({
      name: 'Super Admin',
      password: 'adminpassword', // Will be hashed by pre-save
      role: 'superadmin',
      department: 'Management',
      licenseId: 'ADMIN-001',
      phone: '+998901234567',
      tab_num: '1',
      isActive: true
    });
    console.log('✅ Superadmin created');

    // Create a Station
    const station = await Station.create({
      name: 'Alisher Navoi',
      password: 'stationpassword',
      department: 'Line 1',
      isActive: true
    });
    console.log('✅ Station created');

    // Register a Device for the station
    await Device.create({
      stationId: station._id,
      macAddress: '00:00:00:00:00:00',
      deviceToken: 'TOKEN_123',
      computerName: 'STATION_PC_01',
      isActive: true
    });
    console.log('✅ Device registered');

    // Create a Duty User
    await User.create({
      name: 'Duty Officer Behruz',
      password: 'duty password',
      role: 'duty',
      department: 'Line 1',
      licenseId: 'DUTY-101',
      phone: '+998991234567',
      tab_num: '101',
      isActive: true
    });
    console.log('✅ Duty user created');

    console.log('🚀 Database initialization complete!');
    process.exit();
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    process.exit(1);
  }
};

initDB();
