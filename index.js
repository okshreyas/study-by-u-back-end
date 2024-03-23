// Removed the registration code for sample user creation

const express = require("express");
const path = require("path");

const jwt = require("jsonwebtoken");
const config = require("config");

const connectDB = require("./config/db");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("./Models/User");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser"); // Import body-parser

app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// cors
app.use(cors());

//  add cors
const corsoptions = {
  origin: "http://localhost:3000",
  method:
    "POST , GET , PUT , DELETE , PATCH , OPTIONS , HEAD , CONNECT , TRACE , COPY , LOCK , MKCOL , MOVE , PROPFIND , PROPPATCH , SEARCH , UNLOCK , BIND , REBIND , UNBIND , ACL , REPORT , MKACTIVITY , CHECKOUT , MERGE , M-SEARCH , NOTIFY , SUBSCRIBE , UNSUBSCRIBE , PATCH , PURGE , MKCALENDAR , LINK , UNLINK , SOURCE , and any other method that is implemented by the server or available in future",
  Credentials: true,
};

// Set view engine as EJS
app.set("view engine", "ejs");

// Middleware
app.use(express.json({ extended: false })); // Body parser middleware

// Define Routes

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

app.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

// Define Routes
app.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

// Register Route
app.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
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
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      user = new User({
        name,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // JWT

      const payload = {
        user: { id: user.id },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      // res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// entire Login Route with console.log
app.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    console.log("Login route hit1"); // HIT
    const errors = validationResult(req);
    console.log(errors);

    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }
    console.log("Login route hit2");
    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      console.log("Login route hit3");
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
        console.log("Login route hit4");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Login route hit5");
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
        console.log("Login route hit6");
      }
      const payload = {
        user: { id: user.id },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      // res.json({ message: "User logged in successfully!" });
      console.log("Login route hit7");
    } catch (err) {
      console.error(err.message);
      console.log("Login route hit8");
      res.status(500).send("Server Error");
    }
  }
);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
