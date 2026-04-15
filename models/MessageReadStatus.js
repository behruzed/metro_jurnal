const mongoose = require('mongoose');

const messageReadStatusSchema = new mongoose.Schema({
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'DispatcherMessage', required: true },
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  readBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  readAt: { type: Date, default: Date.now }
}, { timestamps: true });

messageReadStatusSchema.index({ messageId: 1, stationId: 1, readBy: 1 }, { unique: true });

module.exports = mongoose.model('MessageReadStatus', messageReadStatusSchema);
