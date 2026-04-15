const mongoose = require('mongoose');

const dispatcherMessageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { 
    type: String, 
    enum: ['all', 'station', 'department'], 
    default: 'all' 
  },
  targetId: { type: String }, // optional: stationId or department name
  isUrgent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DispatcherMessage', dispatcherMessageSchema);
