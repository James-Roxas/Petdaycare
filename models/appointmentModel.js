const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
  owner: String,
  userId: String,
  startDate: Date,
  duration: Number,
  additionalInfo: String,
  pickupOption: String,
  pickupAddress: String,
  
  // Approval workflow status
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Accepted','Ignored'],
    default: 'Pending'
  },

  // Automatically derived time-based status
  timeStatus: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Past'],
    default: 'Upcoming'
  }
}, { timestamps: true });


// Pre-save hook to automatically set the status based on dates
appointmentSchema.methods.updateTimeStatus = function () {
  const now = new Date();
  const endDate = new Date(this.startDate);
  endDate.setDate(endDate.getDate() + this.duration);

  if (now < this.startDate) {
    this.timeStatus = 'Upcoming';
  } else if (now >= this.startDate && now <= endDate) {
    this.timeStatus = 'Ongoing';
  } else {
    this.timeStatus = 'Past';
  }
};


module.exports = mongoose.model('Appointment', appointmentSchema);
