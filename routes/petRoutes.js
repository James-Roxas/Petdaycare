const express = require('express');
const router = express.Router();
const Pet = require('../models/pet');
const User = require('../models/user');
const Appointment = require('../models/appointmentModel');
const Notification = require('../models/notificationModel');
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

// GET home page - render home.ejs with pets, appointments, and notifications
router.get('/home', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Unauthorized. Please log in.");
    }

    try {
        const pets = await Pet.find({ userId: req.session.user.id });

        // Fetch appointments and split into upcoming/past
        const allAppointments = await Appointment.find({ owner: req.session.user.id }).populate('pet');
        const now = new Date();
        const upcomingAppointments = allAppointments.filter(appt => appt.date >= now);
        const pastAppointments = allAppointments.filter(appt => appt.date < now);

        // Fetch notifications
        const notifications = await Notification.find({ userId: req.session.user.id }).sort({ createdAt: -1 });

        // Placeholder for payments
        const payments = [];

        res.render('home', { 
            pets, 
            user: req.session.user, 
            upcomingAppointments, 
            notifications, 
            pastAppointments, 
            payments 
        });
    } catch (err) {
        console.error("Error fetching dashboard data:", err);
        res.status(500).send("Error loading dashboard.");
    }
});

// POST route for adding pet status
router.post('/add-pet', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Unauthorized. Please log in.");
    }

    const { name, status } = req.body;
    const owner = req.session.user.name;
    
    const newPet = new Pet({
        name,
        status,
        owner,
        userId: req.session.user.id
    });

    try {
        await newPet.save();
        res.redirect('/pet/home');
    } catch (err) {
        console.error("Error adding new pet:", err);
        res.status(500).send("Error adding pet.");
    }
});

// GET route to render the pet profile creation form
router.get('/create', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('petprofile', { user: req.session.user });
});

// POST route for creating a pet profile
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

// View specific pet profile
router.get('/view/:petId', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Unauthorized. Please log in.");
    }

    const petId = req.params.petId;

    try {
        const pet = await Pet.findById(petId);
        if (!pet) {
            return res.status(404).send("Pet not found.");
        }

        res.render('viewPetProfile', { pet, user: req.session.user });
    } catch (err) {
        console.error("Error fetching pet profile:", err);
        res.status(500).send("Error fetching pet profile.");
    }
});


//Edit
router.get('/edit/:petId', async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');

  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet || pet.userId !== req.session.user.id) {
      return res.status(403).send("Not authorized to edit this pet.");
    }
    res.render('editPetProfile', { pet });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading edit form.");
  }
});
router.post('/edit/:petId', upload.single('photo'), async (req, res) => {
  if (!req.session.user) return res.status(401).send("Unauthorized.");

  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet || pet.userId !== req.session.user.id) {
      return res.status(403).send("Not authorized to edit this pet.");
    }

    // Update fields
    pet.name = req.body.name;
    pet.breed = req.body.breed;
    pet.age = req.body.age;
    pet.weight = req.body.weight;
    pet.color = req.body.color;
    pet.gender = req.body.gender;
    pet.birthday = req.body.birthday;
    pet.spayed = req.body.spayed;
    pet.notes = req.body.notes;

    if (req.file) {
      pet.photo = `/uploads/${req.file.filename}`;
    }

    await pet.save();
    res.redirect(`/pet/view/${pet._id}`);
  } catch (err) {
    console.error("Error updating pet:", err);
    res.status(500).send("Failed to update pet.");
  }
});

//delete Pet 
router.post('/delete/:petId', async (req, res) => {
  if (!req.session.user) return res.status(401).send("Unauthorized.");

  try {
    const pet = await Pet.findById(req.params.petId);

    if (!pet || pet.userId !== req.session.user.id) {
      return res.status(403).send("Not authorized to delete this pet.");
    }
    
    const fs = require('fs');
const path = require('path');

if (pet.photo) {
  const imagePath = path.join(__dirname, '..', 'public', pet.photo);
  fs.unlink(imagePath, (err) => {
    if (err) console.warn("Failed to delete photo:", err);
  });
}


    await Pet.deleteOne({ _id: req.params.petId });

    res.redirect('/pet/home');
  } catch (err) {
    console.error("Error deleting pet:", err);
    res.status(500).send("Failed to delete pet.");
  }
});


module.exports = router;
