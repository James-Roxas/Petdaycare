const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },  // ✅ Add this line
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'worker', 'user'], default: 'user' }
});

module.exports = mongoose.model("User", userSchema);
