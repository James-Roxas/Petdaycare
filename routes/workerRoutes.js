const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/auth');
const workerController = require('../controllers/workerController');

router.get('/dashboard', checkRole(['worker']), workerController.dashboard);

module.exports = router;
