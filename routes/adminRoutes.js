const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/dashboard', checkRole(['admin']), adminController.dashboard);

module.exports = router;
