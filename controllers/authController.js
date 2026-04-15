const User = require('../models/User');
const Station = require('../models/Station');
const Device = require('../models/Device');
const ActivityLog = require('../models/ActivityLog');
const { generateStationToken, generateEmployeeToken } = require('../utils/tokenUtils');
const bcrypt = require('bcryptjs');

// @desc    Station Login (Step 1)
// @route   POST /api/auth/station-login or /api/auth/station/login
// @access  Public
const stationLogin = async (req, res) => {
  const { name, password, macAddress, deviceToken } = req.body;

  try {
    const station = await Station.findOne({ name });
    if (!station) {
      return res.status(401).json({ message: 'Station name or password incorrect' });
    }

    const isMatch = await bcrypt.compare(password, station.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Station name or password incorrect' });
    }

    const disableDeviceControl = process.env.DISABLE_DEVICE_CONTROL !== 'false';
    let device = null;

    if (!disableDeviceControl) {
      // Check Device
      device = await Device.findOne({ stationId: station._id, macAddress, deviceToken });
      if (!device) {
        // Create new activity log for failure
        await ActivityLog.create({
          stationId: station._id,
          actionType: 'station_login_failed',
          device: macAddress,
          ipAddress: req.ip,
          createdAt: new Date()
        });
        return res.status(401).json({ message: 'Unauthorized device. Please contact admin.' });
      }

      if (!device.isActive) {
        return res.status(401).json({ message: 'Device is deactivated. Contact admin.' });
      }

      // Update lastActive
      device.lastActive = Date.now();
      await device.save();

      // Success Activity Log
      await ActivityLog.create({
        stationId: station._id,
        actionType: 'station_login_success',
        device: macAddress,
        ipAddress: req.ip,
        createdAt: new Date()
      });
    } else {
      console.warn('Device control disabled: skipping device validation for station login.');
    }

    const token = generateStationToken(station._id, device ? device._id : null);

    res.json({
      _id: station._id,
      name: station.name,
      department: station.department,
      stationToken: token
    });

  } catch (error) {
    console.error('Station login error:', error.message);
    res.status(500).json({ message: 'Server error during station login' });
  }
};

// @desc    Employee Login (Step 2)
// @route   POST /api/auth/employee-login or /api/auth/employee/login
// @access  StationOnly (requires station token)
// Actually, this route will be protected by protectStation middleware later
const employeeLogin = async (req, res) => {
  const { licenseId, password } = req.body;

  try {
    const user = await User.findOne({ licenseId });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or license ID' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Employee account deactivated' });
    }

    // Activity Log
    await ActivityLog.create({
      userId: user._id,
      stationId: req.station._id,
      actionType: 'employee_login_success',
      device: req.deviceId,
      ipAddress: req.ip,
      createdAt: new Date()
    });

    const token = generateEmployeeToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      licenseId: user.licenseId,
      employeeToken: token
    });

  } catch (error) {
    console.error('Employee login error:', error.message);
    res.status(500).json({ message: 'Server error during employee login' });
  }
};

module.exports = { stationLogin, employeeLogin };
