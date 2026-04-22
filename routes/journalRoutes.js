const express = require('express');
const router = express.Router();
const { 
  getJournalTypes, 
  createJournalEntry, 
  getStationEntries,
  getOpenDU5Entries,
  closeDU5Entry
} = require('../controllers/journalController');
const { protectStation, protectEmployee, authorizeRoles } = require('../middleware/authMiddleware');

// PROTECTED ROUTES (Both Station and Employee session required)

// Get available journal types
router.get('/types', protectStation, protectEmployee, getJournalTypes);

// Create a new journal entry
router.post('/entries', protectStation, protectEmployee, createJournalEntry);

// Get journal entry history for the station
router.get('/entries', protectStation, protectEmployee, getStationEntries);

// Get open DU-5 journal entries for tunnel tracking
router.get('/entries/open/du5', protectStation, protectEmployee, getOpenDU5Entries);

// Close a DU-5 journal entry (mark as exited)
router.put('/entries/:id/close', protectStation, protectEmployee, closeDU5Entry);

// ADMIN ONLY ROUTES
// router.post('/types/create', protectStation, protectEmployee, authorizeRoles('superadmin'), createJournalType);

module.exports = router;
