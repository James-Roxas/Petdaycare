const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: String,
  breed: String,
  age: Number,
  gender: String,
  color: String,
  birthday: Date,
  spayed: String,
  weight: Number,
  photo: String, // store image filename or path
  notes: String,
  owner: String,
  userId: String
});

module.exports = mongoose.model('Pet', petSchema);
