const bcrypt = require("bcrypt");
const collection = require("../src/config");
const User = require("../models/user"); 

exports.signup = async (req, res) => {
  const data = {
    name: req.body.username,
    password: req.body.password
  };

  const existingUser = await User.findOne({ name: data.name });
  if (existingUser) {
    return res.render("signup", { errorMessage: "User already exists. Please choose a different username." });
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  data.password = hashedPassword;

  const newUser = new User(data);
  await newUser.save();
  res.redirect("/");
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ name: username });

    if (!user) {
      return res.send("Invalid username or password");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.send("Invalid username or password");
    }

    // ✅ Store user info in session
    req.session.user = {
      id: user._id,
      name: user.name,
      role: user.role
    };

    // ✅ Redirect based on role
    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else if (user.role === 'worker') {
      return res.redirect('/worker/dashboard');
    } else {
      return res.redirect('/pet/home');
    }

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send("Server error");
  }
};
