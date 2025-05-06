const express = require('express');
const router = express.Router();
const Pet = require('../models/pet'); // Pet model

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
        res.render('edit-pet', { pet });
    } catch (err) {
        console.error("Error fetching pet:", err);
        res.status(500).send("Error fetching pet.");
    }
});

// Save updated pet details (worker)
router.post('/edit-pet/:id', async (req, res) => {
    const petId = req.params.id;
    const { name, status, owner } = req.body;

    try {
        await Pet.findByIdAndUpdate(petId, { name, status, owner });
        res.redirect('/worker/dashboard');
    } catch (err) {
        console.error("Error updating pet:", err);
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
