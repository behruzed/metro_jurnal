const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Station = require('../models/Station');
const Device = require('../models/Device');

const parseAuthHeader = (authorizationHeader) => {
  const tokens = {
    stationToken: null,
    employeeToken: null,
  };

  if (typeof authorizationHeader !== 'string') {
    return tokens;
  }

  const stationMatch = authorizationHeader.match(/Bearer\s+Station\s+([^\s]+)/i);
  const employeeMatch = authorizationHeader.match(/Bearer\s+Employee\s+([^\s]+)/i);

  if (stationMatch) {
    tokens.stationToken = stationMatch[1];
  }

  if (employeeMatch) {
    tokens.employeeToken = employeeMatch[1];
  }

  return tokens;
};

// Middleware to protect routes that require a logged-in station session
const protectStation = async (req, res, next) => {
  const { stationToken } = parseAuthHeader(req.headers.authorization);

  if (!stationToken) {
    return res.status(401).json({ message: 'No station session token provided' });
  }

  try {
    const decoded = jwt.verify(stationToken, process.env.STATION_JWT_SECRET || 'station_secret');

    req.station = await Station.findById(decoded.id).select('-password');
    req.deviceId = decoded.deviceId;

    if (!req.station || !req.station.isActive) {
      return res.status(401).json({ message: 'Station session invalid or inactive' });
    }

    next();
  } catch (error) {
    console.error('Station auth error:', error.message);
    res.status(401).json({ message: 'Not authorized as a valid station' });
  }
};

// Middleware to protect routes that require a logged-in employee
const protectEmployee = async (req, res, next) => {
  const { employeeToken } = parseAuthHeader(req.headers.authorization);

  if (!employeeToken) {
    return res.status(401).json({ message: 'No employee token provided' });
  }

  try {
    const decoded = jwt.verify(employeeToken, process.env.JWT_SECRET || 'employee_secret');

    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ message: 'User account disabled or not found' });
    }

    next();
  } catch (error) {
    console.error('Employee auth error:', error.message);
    res.status(401).json({ message: 'Not authorized as a user' });
  }
};

// Middleware to authorize specific roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role (${req.user ? req.user.role : 'none'}) is not allowed to access this resource` 
      });
    }
    next();
  };
};

module.exports = { protectStation, protectEmployee, authorizeRoles };
