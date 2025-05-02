const express = require('express');
const path = require("path");
const session = require("express-session");
const authRoutes = require("../routes/authRoutes");
const jwt = require('jsonwebtoken');

const day_care_app = express();

day_care_app.use(express.json());
day_care_app.use(express.urlencoded({ extended: false }));
day_care_app.set('view engine', 'ejs');
day_care_app.use(express.static("public"));

// Session (optional but useful later)
day_care_app.use(session({ secret: "purrfect_secret", resave: false, saveUninitialized: true }));

// Routes
day_care_app.use("/", authRoutes);
day_care_app.use('/admin', adminRoutes);  

const port = 5000;
day_care_app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

const token = jwt.sign(
    { id: check._id, role: check.role },
    'your_secret_key',
    { expiresIn: '1h' }
  );
  
  res.cookie("token", token).redirect(`/${check.role}/dashboard`);


const adminRoutes = require('../routes/adminRoutes');
