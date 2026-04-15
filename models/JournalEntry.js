const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  journalTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'JournalType', required: true },
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }, // Dynamic fields data
  status: { type: String, enum: ['pending', 'verified', 'approved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
