const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: String,
  status: String,
  owner: String
});

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;
