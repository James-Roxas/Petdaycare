const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/auth');

router.get('/dashboard', checkRole(['admin']), (req, res) => {
  res.render('admin_dashboard', {
    users: [], // Fetch users from DB if needed
    pets: [],  // Fetch pets if needed
    user: req.session.user
  });
});

module.exports = router;
