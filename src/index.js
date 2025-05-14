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
  
const multer = require('multer');
const fs = require('fs');


const authRoutes = require("../routes/authRoutes");
const adminRoutes = require('../routes/adminRoutes'); 
const petRoutes = require('../routes/petRoutes');
const workerRoutes = require('../routes/workerRoutes');
const userRoutes = require('../routes/userRoutes');
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
  res.render("defaultHomePage");
});
day_care_app.use("/auth", authRoutes);
day_care_app.use("/pet", petRoutes);
day_care_app.use('/admin', adminRoutes);
day_care_app.use("/worker", workerRoutes); 
day_care_app.use("/user", userRoutes);  // Use '/user' or adjust if you prefer

// Gallery page
day_care_app.get("/gallery", (req, res) => {
  res.render("gallery"); 
});

// Contact page
day_care_app.get('/contact', async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect('/auth/login');  // Redirect to login if no user session
  }

  const token = req.session.token || req.cookies?.token;  // Check for token in session or cookies

  if (!token) {
    return res.redirect('/auth/login');  // Redirect if no token is found
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, "purrfect_secret"); 

    // Retrieve the user record using the decoded data
    const userRecord = await User.findById(decoded.userRecord._id);

    if (!userRecord) {
      // If no user is found, redirect to login
      return res.redirect('/auth/login');
    }

    // Fetch pets associated with this user
    const pets = await Pet.find({ userId: userRecord._id });

    // Pass the user and pets to the contact.ejs view
    res.render('contact', {
      title: 'Contact Us',
      user: userRecord,
      pets: pets  // Pass pets data to the view
    });
  } catch (err) {
    console.error('Error fetching user or pets:', err.message);
    res.redirect('/auth/login');  // Redirect to login in case of error
  }
});


// About page
day_care_app.get("/about", (req, res) => {
  res.render("about"); 
});

// Multer setup for profile photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Destination directory for file upload:", 'public/uploads/');
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    console.log("File to be uploaded:", file.originalname);
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow only image files (jpeg, jpg, png, gif)
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    console.log("File type check:", {
      mimetype,
      extname,
      fileMimetype: file.mimetype,
      fileExtname: path.extname(file.originalname).toLowerCase()
    });

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      console.log("Invalid file type detected:", file.originalname);
      return cb(new Error("Only image files are allowed."));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  onFileUploadStart: (file) => {
    console.log(`Started uploading file: ${file.originalname}`);
  },
  onFileUploadComplete: (file) => {
    console.log(`Successfully uploaded file: ${file.originalname}`);
  }
});

// Edit Profile page (GET)
day_care_app.get("/edit-profile", async (req, res) => {
  const token = req.session.token || req.cookies?.token;

  if (!token) return res.redirect('/auth/login');

  try {
    const decoded = jwt.verify(token, "purrfect_secret");
    const user = await User.findById(decoded.userRecord._id);
    if (!user) return res.redirect('/auth/login');

    res.render("Edit_Profile", { user });
  } catch (err) {
    res.status(500).send("Error loading profile.");
  }
});

// Edit Profile page (POST)
day_care_app.post("/edit-profile", upload.single("Userphoto"), async (req, res) => {
  const token = req.session.token || req.cookies?.token;

  if (!token) return res.redirect('/auth/login');

  try {
    const decoded = jwt.verify(token, "purrfect_secret");
    const userId = decoded.userRecord._id;

    const { name, email, PhoneNumber } = req.body;
    const updateData = { name, email, PhoneNumber };

    if (req.file) {
      updateData.Userphoto = "/uploads/" + req.file.filename;
    }

    await User.findByIdAndUpdate(userId, updateData);
    res.redirect("/home");
  } catch (err) {
    res.status(500).send("Failed to update profile.");
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

  if (!token) {
    return res.redirect("/home");
  }

  try {
    const decoded = jwt.verify(token, "purrfect_secret");
    const userRecord = await User.findById(decoded.userRecord._id);
    const userIdString = userRecord._id.toString();

    const pets = await Pet.find({ userId: userIdString });

    // Fetch all appointments and populate pet info
const allAppointments = await Appointment.find({ userId: userIdString }).populate('pet');
    const now = new Date();

    // Attach timeStatus to each appointment
    const appointments = allAppointments.map(appt => {
      const startDate = new Date(appt.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + appt.duration);

      let timeStatus = "Upcoming";
      if (endDate < now) timeStatus = "Past";
      else if (startDate <= now && endDate >= now) timeStatus = "Ongoing";

      return { ...appt._doc, timeStatus };
    });

    // ✅ Debug logging
    console.log("Decoded user:", userRecord.name);
    console.log("Number of pets:", pets.length);
    console.log("Number of appointments:", allAppointments.length);
    appointments.forEach((appt, i) => {
      console.log(`Appointment ${i + 1}:`, {
        petName: appt.pet?.name,
        startDate: appt.startDate,
        duration: appt.duration,
        timeStatus: appt.timeStatus
      });
    });

    const notifications = await Notification.find({ userId: userIdString }).sort({ createdAt: -1 });

    const payments = pets.map(pet => ({
      petName: pet.name,
      status: pet.paymentStatus || "N/A"
    }));

    res.render("home", {
      user: userRecord,
      pets,
      appointments,
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
