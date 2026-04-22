const JournalType = require('../models/JournalType');
const JournalEntry = require('../models/JournalEntry');
const ActivityLog = require('../models/ActivityLog');

const ensureDefaultJournalTypes = async () => {
  const defaultTypes = [
    {
      name: 'DU-2: Train Acceptance/Dispatch',
      code: 'DU-2',
      description: 'Poyezdlarni qabul qilish va jo‘natishni qayd etish jurnali.',
      fields: [
        { name: 'train_number', label: 'Poyezd raqami', type: 'text', required: true },
        { name: 'action_type', label: 'Harakat turi', type: 'text', required: true }, // Will be filled from modal
        { name: 'event_time', label: 'Vaqti', type: 'datetime', required: true },
        { name: 'track_id', label: 'Yo‘l (Rim: I-II, Oddiy: 1-10)', type: 'select', required: true, options: ['I', 'II', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
        { name: 'route_number', label: 'Marshrut raqami', type: 'text', required: false },
        { name: 'comment', label: 'Izoh', type: 'textarea', required: false }
      ]
    },
    {
      name: 'DU-5: Tunnel Personnel',
      code: 'DU-5',
      description: 'Tunnelga tushayotgan xodimlar va ularning guvohnoma maʼlumotlari.',
      fields: [
        { name: 'record_time', label: 'Vaqti (Sana)', type: 'datetime', required: true },
        { name: 'certificateId', label: 'Guvohnoma raqami', type: 'text', required: true },
        { name: 'fullName', label: 'F.I.SH', type: 'text', required: true },
        { name: 'purpose', label: 'Tunelga tushishdan maqsadi', type: 'textarea', required: true },
        { name: 'assignment', label: 'Naryad (ixtiyoriy)', type: 'text', required: false },
        { name: 'exit_location', label: 'Chiqish manzili (bekat)', type: 'select', required: true, options: ['Bodomzor', 'Shahriston', 'Yunusobod', 'Turkiston', 'Minor', 'Abdulla Qodiriy', 'Paxtakor', 'Chorsu'] },
        { name: 'notes', label: 'Qoʻshimcha eslatma', type: 'textarea', required: false }
      ]
    },
    {
      name: 'DU-19: Maneuver Report',
      code: 'DU-19',
      description: 'Manyovr operatsiyalarini qayd etish jurnali.',
      fields: [
        { name: 'record_time', label: 'Sana va vaqt', type: 'datetime', required: true },
        { name: 'wagon_count', label: 'Manyovr tarkibidagi vagonlar soni', type: 'number', required: true },
        { name: 'start_route', label: 'Yo\'l kanava (Boshlanish)', type: 'number', required: true },
        { name: 'end_route', label: 'Yo\'l kanava (Tugash)', type: 'number', required: true },
        { name: 'traffic_light', label: 'Svetofor', type: 'text', required: true },
        { name: 'completion_time', label: 'Amalga oshirilgan vaqti', type: 'datetime', required: true },
        { name: 'employee_name', label: 'Xodim F.I.Sh', type: 'text', required: true },
        { name: 'position', label: 'Lavozimi', type: 'text', required: true },
        { name: 'notes', label: 'Izoh', type: 'textarea', required: false }
      ]
    }
  ];

  for (const typeDef of defaultTypes) {
    const existing = await JournalType.findOne({ code: typeDef.code });
    if (!existing) {
      await JournalType.create(typeDef);
    } else {
      // Update existing to ensure fields match new requirements
      existing.fields = typeDef.fields;
      existing.name = typeDef.name;
      existing.description = typeDef.description;
      await existing.save();
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

// @desc    Get open DU-5 journal entries for the current station
// @route   GET /api/journals/entries/open/du5
// @access  Employee
const getOpenDU5Entries = async (req, res) => {
  try {
    const du5Type = await JournalType.findOne({ code: 'DU-5' });
    const entries = await JournalEntry.find({ 
      stationId: req.station._id,
      journalTypeId: du5Type._id,
      'data.journal_status': { $ne: 'closed' }
    })
      .populate('journalTypeId', 'name code')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });
    
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching open DU-5 entries' });
  }
};

// @desc    Close a DU-5 journal entry with exit info
// @route   PUT /api/journals/entries/:id/close
// @access  Employee
const closeDU5Entry = async (req, res) => {
  const { id } = req.params;
  const { exit_time, exit_location } = req.body;

  try {
    const entry = await JournalEntry.findById(id);
    
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    entry.data.journal_status = 'closed';
    entry.data.exit_time = exit_time;
    entry.data.exit_location = exit_location;
    entry.updatedAt = new Date();
    
    await entry.save();

    await ActivityLog.create({
      userId: req.user._id,
      stationId: req.station._id,
      actionType: 'close_du5_entry',
      targetId: entry._id,
      device: req.deviceId,
      ipAddress: req.ip
    });

    res.json(entry);
  } catch (error) {
    console.error('Error closing journal entry:', error.message);
    res.status(500).json({ message: 'Error closing journal entry' });
  }
};

module.exports = {
  getJournalTypes,
  createJournalEntry,
  getStationEntries,
  getOpenDU5Entries,
  closeDU5Entry
};
