const express = require('express');
const router = express.Router();
const { stationLogin, employeeLogin } = require('../controllers/authController');
const { protectStation } = require('../middleware/authMiddleware');

// Station Login (Step 1)
router.post('/station-login', stationLogin);
router.post('/station/login', stationLogin); // backward-compatible alias

// Employee Login (Step 2) - Protected by Station Session
router.post('/employee-login', protectStation, employeeLogin);
router.post('/employee/login', protectStation, employeeLogin); // backward-compatible alias

module.exports = router;
