const express = require('express');
const router = express.Router();
const Pet = require('../models/pet'); // Pet model
const WorkerBooking = require('../models/workerBooking'); // WorkerBooking model
const { io } = require('../src/index'); // Import io instance
const Appointment = require('../models/appointmentModel'); // Appointment model
const User = require('../models/user'); // Assuming you have a User model for workers


// Debug: Check if io is loaded
console.log("Socket.io in workerRoutes:", io ? "Ready" : "Not Ready");

// View Worker Dashboard (appointments and assigned pets)
router.get('/dashboard', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'worker') {
        return res.status(403).send("Unauthorized access.");
    }

    try {
        // Fetch pending appointments (status: 'Pending') for the worker
        const appointments = await Appointment.find({ approvalStatus: 'Pending' })
            .populate('pet') // Populate pet details
            .exec();

        // Fetch worker's assigned pets via WorkerBooking model
        const workerId = req.session.user._id || req.session.user.id;

const workerBookings = await WorkerBooking.find({ worker: workerId })
    .populate('pet')
    .exec();

        // Render the dashboard with both appointments and workerBookings
        res.render('worker_dashboard', { appointments, workerBookings, user: req.session.user });
    } catch (err) {
        console.error("Error fetching data for worker dashboard:", err);
        res.status(500).send("Error fetching data for worker dashboard.");
    }
});

// View appointment details
router.get('/view-appointment/:appointmentId', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'worker') {
        return res.status(403).send("Unauthorized access.");
    }

    const appointmentId = req.params.appointmentId;
    try {
        const appointment = await Appointment.findById(appointmentId)
            .populate('pet') // Populate pet data
            .exec();

        if (!appointment) {
            return res.status(404).send("Appointment not found.");
        }

        res.render('view-appointment', { appointment });
    } catch (err) {
        console.error("Error fetching appointment:", err);
        res.status(500).send("Error fetching appointment.");
    }
});

// Accept appointment
router.get('/accept-appointment/:appointmentId', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'worker') {
        return res.status(403).send("Unauthorized access.");
    }

    const appointmentId = req.params.appointmentId;
    console.log('Accepting Appointment ID:', appointmentId);  // Log appointment ID

    try {
        const appointment = await Appointment.findById(appointmentId)
            .populate('pet') // Populate pet data
            .exec();

        console.log('Fetched Appointment:', appointment);  // Log fetched appointment

        if (!appointment) {
            return res.status(404).send("Appointment not found.");
        }

        // Update the appointment status to "Accepted"
        appointment.approvalStatus = 'Accepted';
        await appointment.save();
        console.log("Session user data:", req.session.user.id);
        // Create WorkerBooking to link the worker and pet (if not already linked)
        const workerBooking = new WorkerBooking({
            worker: req.session.user.id,  // Set the worker's ID
            pet: appointment.pet._id,
            booking: appointment._id,
            startDate: appointment.startDate,
            endDate: new Date(appointment.startDate.getTime() + appointment.duration * 24 * 60 * 60 * 1000), // Example logic for end date
            status: 'assigned',
            notes: appointment.additionalInfo
        });

        console.log('WorkerBooking Data:', workerBooking);  // Log WorkerBooking data

        await workerBooking.save();  // Save the WorkerBooking

        // Emit event to notify the worker dashboard in real-time
        if (io) {
            io.emit('appointmentStatusUpdated', { id: appointment._id, status: appointment.status });
            io.emit('petAssigned', { petId: appointment.pet._id, workerId: req.session.user._id });
        }

        res.redirect('/worker/dashboard');
    } catch (err) {
        console.error("Error accepting appointment:", err);  // Log the error
        res.status(500).send("Error accepting appointment.");
    }
});

router.get('/ignore-appointment/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).send('Appointment not found');
    
    appointment.approvalStatus = 'Ignored';
    await appointment.save();

    res.redirect('/worker/dashboard'); // or wherever your dashboard is
  } catch (err) {
    console.error(err);
    res.status(500).send('Error ignoring appointment');
  }
});


// Assign worker to a pet (from a booking)
router.post('/assign-worker/:bookingId', async (req, res) => {
    const { workerId, petId, startDate, endDate, notes } = req.body;
    const bookingId = req.params.bookingId;

    try {
        // Find the pet, worker, and booking details
        const pet = await Pet.findById(petId);
        const worker = await User.findById(workerId);
        const booking = await Booking.findById(bookingId);

        if (!pet || !worker || !booking) {
            return res.status(404).send("Pet, Worker, or Booking not found.");
        }

        // Create the WorkerBooking
        const workerBooking = new WorkerBooking({
            worker: worker._id,
            pet: pet._id,
            booking: booking._id,
            startDate,
            endDate,
            status: 'assigned', // Status set to assigned initially
            notes
        });

        // Save the WorkerBooking to the database
        await workerBooking.save();

        // Optionally emit an event via Socket.io to update the UI in real-time
        if (io) {
            io.emit('petAssigned', { petId: pet._id, workerId: worker._id });
        }

        res.status(200).send('Worker successfully assigned to pet.');
    } catch (err) {
        console.error("Error assigning worker:", err);
        res.status(500).send("Error assigning worker.");
    }
});

// Edit pet details (worker)
router.get('/edit-pet/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'worker') {
        return res.status(403).send("Unauthorized access.");
    }

    const petId = req.params.id;
    try {
        const pet = await Pet.findById(petId);
        res.render('edit-petstatus', { pet });
    } catch (err) {
        console.error("Error fetching pet:", err);
        res.status(500).send("Error fetching pet.");
    }
});

// Save updated pet details (worker)
router.post('/edit-pet/:id', async (req, res) => {
    const petId = req.params.id;
    const { status } = req.body;

    try {
        const updatedPet = await Pet.findByIdAndUpdate(
            petId,
            { status },
            { new: true }
        );

        // Emit status update via Socket.io
        if (io) {
            io.emit('petActivityUpdate', { id: updatedPet._id, status: updatedPet.status });
        } else {
            console.warn("Socket.io is not initialized. Skipping emit.");
        }

        res.redirect('/worker/dashboard');
    } catch (err) {
        console.error("Error updating pet:", err.message);
        res.status(500).send("Error updating pet.");
    }
});

// Delete pet (worker)
router.post('/delete-pet/:id', async (req, res) => {
    const petId = req.params.id;

    try {
        await Pet.findByIdAndDelete(petId);
        res.redirect('/worker/dashboard');
    } catch (err) {
        console.error("Error deleting pet:", err);
        res.status(500).send("Error deleting pet.");
    }
});

module.exports = router;
