const Pet = require('../models/pet');

exports.getAllPets = async (req, res) => {
  const pets = await Pet.find();
  res.render('home', { pets });
};

exports.updatePetStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await Pet.findByIdAndUpdate(id, { status });
  res.json({ message: 'Updated' });
};
