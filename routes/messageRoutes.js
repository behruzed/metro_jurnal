const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, markAsRead } = require('../controllers/messageController');
const { protectStation, protectEmployee, authorizeRoles } = require('../middleware/authMiddleware');

// PROTECTED ROUTES (Both Station and Employee session required)

// Get message history
router.get('/', protectStation, protectEmployee, getMessages);

// Mark message as read
router.post('/:id/read', protectStation, protectEmployee, markAsRead);

// DISPATCHER ONLY ROUTES
router.post('/', protectStation, protectEmployee, authorizeRoles('dispatcher', 'superadmin'), sendMessage);

module.exports = router;
