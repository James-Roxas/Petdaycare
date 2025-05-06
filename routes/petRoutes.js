const express = require('express');
const router = express.Router();
const Pet = require('../models/pet'); // Correct path to model
const multer = require('multer');
const path = require('path');

// Storage config for uploading images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }); // Save images to public/uploads/

// Ensure `public/uploads` folder exists

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

// POST route for adding pet status
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

// GET route to render the pet profile creation form
router.get('/create', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect if the user is not logged in
    }
    res.render('petprofile', { user: req.session.user }); // Render the petprofile.ejs page
});

// POST route for creating a pet profile for owners
router.post('/create', upload.single('photo'), async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Unauthorized");
    }

    const { name, breed, age, weight, color, gender, birthday, spayed, notes } = req.body;

    const newPet = new Pet({
        name,
        breed,
        age,
        weight,
        color,
        gender,
        birthday,
        spayed,
        notes,
        photo: req.file ? `/uploads/${req.file.filename}` : null,
        owner: req.session.user.name,
        userId: req.session.user.id
    });

    try {
        await newPet.save();
        res.redirect('/pet/home');
    } catch (err) {
        console.error("Error saving pet profile:", err);
        res.status(500).send("Could not save pet profile.");
    }
});

// Route to view a specific pet profile by ID
router.get('/view/:petId', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Unauthorized. Please log in.");
    }

    const petId = req.params.petId;

    try {
        // Find the pet by ID
        const pet = await Pet.findById(petId);

        if (!pet) {
            return res.status(404).send("Pet not found.");
        }

        // Render the pet profile page with the pet data
        res.render('viewPetProfile', { pet, user: req.session.user });
    } catch (err) {
        console.error("Error fetching pet profile:", err);
        res.status(500).send("Error fetching pet profile.");
    }
});



module.exports = router;
