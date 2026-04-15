const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
  actionType: { type: String, required: true }, // e.g., 'login', 'create_entry', 'edit_entry'
  targetId: { type: mongoose.Schema.Types.Mixed }, // ID of the journal entry or user affected
  device: { type: String }, // e.g., browser name or computer name
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
