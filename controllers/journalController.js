const JournalType = require('../models/JournalType');
const JournalEntry = require('../models/JournalEntry');
const ActivityLog = require('../models/ActivityLog');

const ensureDefaultJournalTypes = async () => {
  const defaultTypes = [
    {
      name: 'DU-2: Train Maneuvers',
      code: 'DU-2',
      description: 'Poyezdlarning manyovr yozuvlari uchun raqamli jurnal.',
      fields: [
        { name: 'route_line', label: 'Yo‘l nomi', type: 'text', required: true },
        { name: 'from_track', label: 'Boshlangan yo‘l', type: 'text', required: false },
        { name: 'to_track', label: 'Tugagan yo‘l', type: 'text', required: false },
        { name: 'maneuver_details', label: 'Manyovr tafsiloti', type: 'textarea', required: true }
      ]
    },
    {
      name: 'DU-5: Tunnel Personnel',
      code: 'DU-5',
      description: 'Tunnelga tushayotgan xodimlar va ularning guvohnoma maʼlumotlari.',
      fields: [
        { name: 'notes', label: 'Qoʻshimcha eslatma', type: 'textarea', required: false }
      ]
    }
  ];

  for (const typeDef of defaultTypes) {
    const existing = await JournalType.findOne({ code: typeDef.code });
    if (!existing) {
      await JournalType.create(typeDef);
    }
  }
};

// @desc    Get all available journal types
// @route   GET /api/journals/types
// @access  Employee
const getJournalTypes = async (req, res) => {
  try {
    await ensureDefaultJournalTypes();
    const types = await JournalType.find({});
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching journal types' });
  }
};

// @desc    Create a new journal entry
// @route   POST /api/journals/entries
// @access  Employee
const createJournalEntry = async (req, res) => {
  const { journalTypeId, data } = req.body;

  try {
    const entry = await JournalEntry.create({
      journalTypeId,
      stationId: req.station._id,
      createdBy: req.user._id,
      data,
      status: 'pending'
    });

    await ActivityLog.create({
      userId: req.user._id,
      stationId: req.station._id,
      actionType: 'create_journal_entry',
      targetId: entry._id,
      device: req.deviceId,
      ipAddress: req.ip
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating journal entry:', error.message);
    res.status(500).json({ message: 'Error creating journal entry' });
  }
};

// @desc    Get journal entries for the current station
// @route   GET /api/journals/entries
// @access  Employee
const getStationEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ stationId: req.station._id })
      .populate('journalTypeId', 'name code')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });
    
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching station entries' });
  }
};

// @desc    Admin: Create a new journal type
// @route   POST /api/journals/types
// @access  Admin/Superadmin
const createJournalType = async (req, res) => {
  const { name, code, description, fields } = req.body;

  try {
    const journalType = await JournalType.create({
      name,
      code,
      description,
      fields
    });

    res.status(201).json(journalType);
  } catch (error) {
    res.status(500).json({ message: 'Error creating journal type' });
  }
};

module.exports = {
  getJournalTypes,
  createJournalEntry,
  getStationEntries,
  createJournalType
};
