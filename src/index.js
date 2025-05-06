const express = require('express');
const path = require("path");
const session = require("express-session");
const http = require('http');
const { Server } = require("socket.io");
require('../src/config');

const authRoutes = require("../routes/authRoutes");
const adminRoutes = require('../routes/adminRoutes'); 
const petRoutes = require('../routes/petRoutes');
const workerRoutes = require('../routes/workerRoutes');
const jwt = require('jsonwebtoken');

const day_care_app = express();
const server = http.createServer(day_care_app);
const io = new Server(server);

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
<<<<<<< HEAD
day_care_app.use('/admin', adminRoutes); 
// Gallery page
day_care_app.get("/gallery", (req, res) => {
  res.render("gallery"); 
});

// Contact page
day_care_app.get("/contact", (req, res) => {
  res.render("contact"); 
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
    res.redirect("/"); // Redirect to homepage after logout
  });
});

=======
day_care_app.use('/admin', adminRoutes); // ✅ Now it works correctly
day_care_app.use('/worker', workerRoutes);
>>>>>>> 4e8c07558d674109cf90147f118071019ea82a19

// Socket.io setup for real-time pet status updates
io.on('connection', (socket) => {
  console.log('a user connected');

  // Example: emit petActivityUpdate every 10 seconds with mock data
  setInterval(() => {
    const mockStatus = { status: 'Active' };
    socket.emit('petActivityUpdate', mockStatus);
  }, 10000);

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const port = 5000;
server.listen(port, () => console.log(`Server running at http://localhost:${port}`));

// Removed misplaced JWT token creation code from here. It should be inside route handlers.
