const collection = require("../src/config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");  // Import JWT
const User = require("../models/user");

exports.signup = async (req, res) => {
  const data = {
    name: req.body.username,
    email: req.body.email,  // ✅ Add this line
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
  res.redirect("/auth/login");
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

    // Create JWT token
    const token = jwt.sign({ userRecord: user }, "purrfect_secret", { expiresIn: '1h' });

    // Store user info in session and token in session/cookies
    req.session.user = {
      id: user._id,
      name: user.name,
      role: user.role
    };
    req.session.token = token; // Store token in session
    res.cookie("token", token, { httpOnly: true }); // Store token in cookies (optional)
    
    // Redirect based on role
    if (user.role === "admin") {
      return res.redirect("/admin/dashboard");
    } else if (user.role === "worker") {
      return res.redirect("/worker/dashboard");
    } else {
      return res.redirect("/home");
    }

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send("Server error");
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out.");
    }
    res.clearCookie("token");  // Clear token from cookies
    res.redirect("/auth/login");
  });
};
