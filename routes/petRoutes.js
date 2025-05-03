const express = require('express');
const router = express.Router();
const Pet = require('../models/pet'); // Correct path to model

// GET home page - render home.ejs with pets data from MongoDB
router.get('/', async (req, res) => {
    try {
        const pets = await Pet.find(); // Fetch pets data from MongoDB
        res.render('home', { pets });
    } catch (err) {
        console.error("Error fetching pets from MongoDB", err);
        res.status(500).send("Error fetching pets.");
    }
});

// POST route for adding a new pet
router.post('/add-pet', async (req, res) => {
    const { name, status, owner } = req.body;
    
    // Create a new pet document
    const newPet = new Pet({
        name,
        status,
        owner
    });

    try {
        // Save the new pet to the database
        await newPet.save();
        // Redirect back to home page to display updated pet list
        res.redirect('/');
    } catch (err) {
        console.error("Error adding new pet:", err);
        res.status(500).send("Error adding pet.");
    }
});

module.exports = router;
