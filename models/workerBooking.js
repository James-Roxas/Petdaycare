const mongoose = require('mongoose');

// WorkerBooking schema
const workerBookingSchema = new mongoose.Schema({
  worker: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Reference to the Worker (User model) 
    required: true 
  },
  pet: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pet', // Reference to the Pet model
    required: true 
  },
  booking: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', // Reference to the Booking model
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'assigned' // Initially, a worker is assigned
  },
  notes: { 
    type: String 
  }
}, { timestamps: true });

const WorkerBooking = mongoose.model('WorkerBooking', workerBookingSchema);

module.exports = WorkerBooking;
