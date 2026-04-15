const DispatcherMessage = require('../models/DispatcherMessage');
const MessageReadStatus = require('../models/MessageReadStatus');
const ActivityLog = require('../models/ActivityLog');

// @desc    Send a new dispatcher message (Real-time handled in index.js)
// @route   POST /api/messages
// @access  Dispatcher/Superadmin
const sendMessage = async (req, res) => {
  const { text, targetType, targetId, isUrgent } = req.body;

  try {
    const message = await DispatcherMessage.create({
      text,
      createdBy: req.user._id,
      targetType,
      targetId,
      isUrgent
    });

    await ActivityLog.create({
      userId: req.user._id,
      stationId: req.station?._id, // Might be null if dispatcher is global
      actionType: 'send_dispatcher_message',
      targetId: message._id,
      device: req.deviceId,
      ipAddress: req.ip
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
};

// @desc    Get message history
// @route   GET /api/messages
// @access  Employee
const getMessages = async (req, res) => {
  try {
    // Filter messages based on station department or "all"
    const messages = await DispatcherMessage.find({
      $or: [
        { targetType: 'all' },
        { targetType: 'station', targetId: req.station._id },
        { targetType: 'department', targetId: req.station.department }
      ]
    })
    .populate('createdBy', 'name role')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

// @desc    Mark message as read
// @route   POST /api/messages/:id/read
// @access  Employee
const markAsRead = async (req, res) => {
  try {
    const readStatus = await MessageReadStatus.create({
      messageId: req.params.id,
      stationId: req.station._id,
      readBy: req.user._id
    });

    res.status(201).json(readStatus);
  } catch (error) {
    if (error.code === 11000) {
       return res.status(200).json({ message: 'Already read' });
    }
    res.status(500).json({ message: 'Error marking message as read' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markAsRead
};
