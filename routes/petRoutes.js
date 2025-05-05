const express = require('express');
const router = express.Router();
const Pet = require('../models/pet'); // Correct path to model

// GET home page - render home.ejs with pets data from MongoDB
router.get('/home', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Unauthorized. Please log in.");
    }

    try {
        const pets = await Pet.find({ userId: req.session.user.id }); // Filter by user
        res.render('home', { pets, user: req.session.user });
    } catch (err) {
        console.error("Error fetching pets from MongoDB", err);
        res.status(500).send("Error fetching pets.");
    }
});

// POST route for adding a new pet
router.post('/add-pet', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Unauthorized. Please log in.");
    }

    const { name, status } = req.body;
    const owner = req.session.user.name; // Automatically assign the logged-in user's name as the owner
    
    const newPet = new Pet({
        name,
        status,
        owner, // Automatically assign the owner based on the session
        userId: req.session.user.id // Save the user ID as well for linking the pet to the user
    });

    try {
        await newPet.save();
        res.redirect('/pet/home'); // Redirect to the home page after adding the pet
    } catch (err) {
        console.error("Error adding new pet:", err);
        res.status(500).send("Error adding pet.");
    }
});



module.exports = router;
