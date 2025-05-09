const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  date: Date,
  service: String,
  owner: String, // Should match userId
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
