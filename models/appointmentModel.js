const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },  // Linked pet
  owner: String,        // Owner's name
  userId: String,       // Owner's user ID
  startDate: Date,      // Start date for the service
  duration: Number,     // Duration in days/nights
  additionalInfo: String, // Extra info for the sitter
  pickupOption: String,   // Whether pickup is required (yes/no)
  pickupAddress: String,  // Pickup address (if applicable)
  status: {
    type: String,
    enum: ['Pending', 'Accepted'],  // Only allow these two statuses
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
