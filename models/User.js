const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['duty', 'dispatcher', 'head', 'superadmin'], 
    default: 'duty',
    required: true 
  },
  department: { type: String, required: true }, // e.g., 'Transport', 'Security'
  licenseId: { type: String, required: true, unique: true }, // Service ID
  phone: { type: String },
  tab_num: { type: String }, // Internal Employee number
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
