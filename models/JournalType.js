const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'number', 'date', 'datetime', 'select', 'boolean', 'textarea'], 
    default: 'text' 
  },
  required: { type: Boolean, default: false },
  options: [{ type: String }] // For select type
});

const journalTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true }, // Short code for system use
  description: { type: String },
  fields: [fieldSchema],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('JournalType', journalTypeSchema);
