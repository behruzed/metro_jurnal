const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  macAddress: { type: String, required: true },
  deviceToken: { type: String, required: true, unique: true },
  ipAddress: { type: String },
  computerName: { type: String },
  lastActive: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
