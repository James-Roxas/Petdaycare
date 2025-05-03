const express = require('express');
const path = require("path");
const session = require("express-session");
const http = require('http');
const { Server } = require("socket.io");
require('../src/config');

const authRoutes = require("../routes/authRoutes");
const adminRoutes = require('../routes/adminRoutes'); // ✅ Moved up
const petRoutes = require('../routes/petRoutes');
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

// Routes
day_care_app.use("/", petRoutes);
day_care_app.use("/auth", authRoutes);
day_care_app.use('/admin', adminRoutes); // ✅ Now it works correctly

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
