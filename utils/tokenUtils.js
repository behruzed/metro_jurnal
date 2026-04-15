const jwt = require('jsonwebtoken');

const generateStationToken = (id, deviceId) => {
  return jwt.sign({ id, deviceId }, process.env.STATION_JWT_SECRET || 'station_secret', {
    expiresIn: '7d'
  });
};

const generateEmployeeToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'employee_secret', {
    expiresIn: '1d'
  });
};

module.exports = { generateStationToken, generateEmployeeToken };
