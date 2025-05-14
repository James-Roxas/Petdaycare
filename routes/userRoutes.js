const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/auth');  // Make sure checkRole is a function
const adminController = require('../controllers/adminController');  // Check if adminController.dashboard is valid
const Appointment = require('../models/appointmentModel');
const Pet = require('../models/pet'); // Import the Pet model

// Ensure checkRole is a valid function before using it
router.get('/dashboard', (req, res, next) => {
  if (typeof checkRole === 'function') {
    checkRole(['admin'])(req, res, next);  // Call it as a middleware
  } else {
    return res.status(500).send('checkRole is not a function');
  }
}, (req, res, next) => {
  if (adminController && typeof adminController.dashboard === 'function') {
    adminController.dashboard(req, res, next);  // Use the controller function as middleware
  } else {
    return res.status(500).send('adminController.dashboard is not a function');
  }
});

router.post('/book', async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login'); // Ensure user is logged in

  const { petId, additionalInfo, startDate, duration, pickupOption, pickupAddress } = req.body;

  try {
    // Find the pet by ID
    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).send("Pet not found.");

    // Create a new appointment
    const appointment = new Appointment({
      pet: pet._id,
      owner: req.session.user.name,
      userId: req.session.user.id,
      startDate,
      duration,
      additionalInfo,
      pickupOption,
      pickupAddress: pickupOption === "yes" ? pickupAddress : null, // Save the address only if pickup is "yes"
      status: 'Pending'
    });

    await appointment.save(); // Save the appointment in the database
    res.redirect('/home'); // Redirect to the pet dashboard (or another relevant page)

  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).send("Failed to book appointment.");
  }
});


// View full appointment history
router.get('/appointments/history', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const allAppointments = await Appointment.find({ userId: req.session.user.id })
      .populate('pet')
      .sort({ startDate: -1 }) // newest first
      .exec();

    // Filter only past appointments
    const now = new Date();
    const pastAppointments = allAppointments.filter(a => {
      const endDate = new Date(a.startDate);
      endDate.setDate(endDate.getDate() + a.duration);
      return endDate < now;
    });

    res.render('appointmentHistory', {
      appointments: pastAppointments,
      user: req.session.user
    });
  } catch (err) {
    console.error("Error loading appointment history:", err);
    res.status(500).send("Error loading appointment history.");
  }
});


module.exports = router;
