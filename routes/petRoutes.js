const express = require('express');
const router = express.Router();

// Mock pets data
const pets = [
  { _id: '1', name: 'Fluffy', status: 'Sleeping' },
  { _id: '2', name: 'Spot', status: 'Playing' },
  { _id: '3', name: 'Whiskers', status: 'Eating' }
];

// GET home page - render home.ejs with pets data
router.get('/', (req, res) => {
  res.render('home', { pets });
});

module.exports = router;
