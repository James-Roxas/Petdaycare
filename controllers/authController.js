const bcrypt = require("bcrypt");
const collection = require("../src/config");

exports.signup = async (req, res) => {
  const data = {
    name: req.body.username,
    password: req.body.password
  };

  const existingUser = await collection.findOne({ name: data.name });
  if (existingUser) {
    return res.status(400).send("User already exists.");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  data.password = hashedPassword;

  await collection.insertMany(data);
  res.redirect("/login");
};

exports.login = async (req, res) => {
  try {
    const check = await collection.findOne({ name: req.body.username });
    if (!check) return res.send("Username not found");

    const match = await bcrypt.compare(req.body.password, check.password);
    if (!match) return res.status(400).send("Invalid password.");

    res.render("home");
  } catch {
    res.send("Login error");
  }
};
