const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Change `adminController.dashboard` to `getAdminDashboard`
router.get('/dashboard', checkRole(['admin']), adminController.getAdminDashboard);

module.exports = router;
