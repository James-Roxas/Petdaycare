const express = require('express');
const path = require("path");
const session = require("express-session");
const http = require('http');
const { Server } = require("socket.io");
const Pet = require('../models/pet');
const User = require('../models/user');
const Appointment = require('../models/appointmentModel');
const Notification = require('../models/notificationModel');
require('../src/config');
  

const authRoutes = require("../routes/authRoutes");
const adminRoutes = require('../routes/adminRoutes'); 
const petRoutes = require('../routes/petRoutes');
const workerRoutes = require('../routes/workerRoutes');
const jwt = require('jsonwebtoken');

const day_care_app = express();
const server = http.createServer(day_care_app);
const io = new Server(server);

// Export io so it can be used in routes (like workerRoutes)
module.exports.io = io;

day_care_app.use(express.json());
day_care_app.use(express.urlencoded({ extended: false }));
day_care_app.set('view engine', 'ejs');
day_care_app.use(express.static("public"));

// Session (optional but useful later)
day_care_app.use(session({ secret: "purrfect_secret", resave: false, saveUninitialized: true }));

day_care_app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
// Public homepage (shown only if user not logged in)
day_care_app.get("/", (req, res) => {
  const token = req.session.token || req.cookies?.token;
  if (token) {
    // redirect to dashboard if logged in
    return res.redirect("/home");
  }
  res.render("defaultHomepage");
});
day_care_app.use("/auth", authRoutes);
day_care_app.use("/pet", petRoutes);
day_care_app.use('/admin', adminRoutes);
day_care_app.use("/worker", workerRoutes); 
// Gallery page
day_care_app.get("/gallery", (req, res) => {
  res.render("gallery"); 
});

// Contact page
day_care_app.get('/contact', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  res.render('contact', {
    title: 'Contact Us',
    user: req.session.user
  });
});

// About page
day_care_app.get("/about", (req, res) => {
  res.render("about"); 
});

// Edit Profile page
day_care_app.get("/edit-profile", (req, res) => {
  const token = req.session.token || req.cookies?.token;
  if (token) {
    res.render("editProfile"); // Make sure you have an editProfile.ejs file
  } else {
    res.redirect("/home"); // Redirect to homepage if not logged in
  }
});

// Logout
day_care_app.get("/logout", (req, res) => {
  // Destroy the session and redirect to homepage
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to log out");
    }
    res.redirect("/"); // Redirect to default homepage after logout
  });
});

// Socket.io setup
io.on('connection', (socket) => {
  console.log('a user connected');

  // Optional: Periodic test emission
  // setInterval(() => {
  //   socket.emit('petActivityUpdate', { status: 'Active' });
  // }, 10000);

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


// Home dashboard (for logged-in users like pet owners)
day_care_app.get("/home", async (req, res) => {
  const token = req.session.token || req.cookies?.token;

  if (!req.session.token && !req.cookies?.token) {
    return res.redirect("/home");  // If there's no token, redirect to login page
  }
  

  try {
    const decoded = jwt.verify(token, "purrfect_secret");
    const userRecord = await User.findById(decoded.userRecord._id);

    const userIdString = userRecord._id.toString();

    // Fix: convert ObjectId to string
    const pets = await Pet.find({ userId: userIdString });

    const allAppointments = await Appointment.find({ owner: userIdString }).populate('pet');
    const now = new Date();
    const upcomingAppointments = allAppointments.filter(appt => new Date(appt.date) >= now);
    const pastAppointments = allAppointments.filter(appt => new Date(appt.date) < now);

    const notifications = await Notification.find({ userId: userIdString }).sort({ createdAt: -1 });

    const payments = pets.map(pet => ({
      petName: pet.name,
      status: pet.paymentStatus || "N/A"
    }));

    res.render("home", {
      user: userRecord,
      pets,
      upcomingAppointments,
      pastAppointments,
      notifications,
      payments
    });

  } catch (err) {
    console.error("Home route error:", err.message);
    res.redirect("/home");
  }
});


const port = 5000;
server.listen(port, () => console.log(`Server running at http://localhost:${port}`));

// Removed misplaced JWT token creation code from here. It should be inside route handlers.
