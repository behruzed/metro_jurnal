const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Using simple password for stations as per requirement or hashed? 
// Stated: 'password' (presumably hashed).
const bcrypt = require('bcryptjs');
stationSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('Station', stationSchema);