const express = require('express');
const router = express.Router();
const Pet = require('../models/pet'); // Pet model
const { io } = require('../src/index'); // Import io instance

// Debug: Check if io is loaded
console.log("Socket.io in workerRoutes:", io ? "Ready" : "Not Ready");

// Worker Dashboard: View all pets (admin/workers can see all pets)
router.get('/dashboard', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'worker') {
        return res.status(403).send("Unauthorized access.");
    }

    try {
        const pets = await Pet.find(); // Worker can see all pets
        res.render('worker_dashboard', { pets, user: req.session.user });
    } catch (err) {
        console.error("Error fetching pets:", err);
        res.status(500).send("Error fetching pets.");
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

        // Safe emit
        if (io) {
            io.emit('petActivityUpdate', { id: updatedPet._id, status: updatedPet.status });
        } else {
            console.warn("Socket.io is not initialized. Skipping emit.");
        }

        res.redirect('/worker/dashboard');
    } catch (err) {
        console.error("Error updating pet:", err.message); // log the message
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
