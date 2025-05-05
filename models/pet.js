const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: String,
  status: String,
  owner: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
});

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;
