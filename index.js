const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// Sample user data
const sampleUserData = {
  name: "John Doe",
  email: "john@example.com",
  password: "password123"
};

// Create a new user
User.create(sampleUserData)
  .then(user => {
    console.log("Sample user created:", user);
  })
  .catch(err => {
    console.error("Error creating sample user:", err);
  });


const app = express();

// Connect to MongoDB
connectDB();

// Set view engine as EJS
app.set("view engine", "ejs");

// Middleware
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

app.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

// Define Routes
app.get("/register", (req, res) => {
  res.render("register", { title: "Register" }); // Removed forward slash before "register"
});



// Register Route
app.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a password with 6 or more characters").isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ errors: [{ msg: "User already exists" }] });
      }

      user = new User({
        name,
        email,
        password
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      res.send("User registered successfully!");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// Login Route
app.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
      }

      // For simplicity, you can generate a JWT token here and send it back for authentication

      res.send("User logged in successfully!");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
