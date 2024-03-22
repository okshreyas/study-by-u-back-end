const express = require("express");
const connectDB = require("./config/db");
const jwt = require("jsonwebtoken");
const config = require("config");

const app = express();
const mockUser = {
     id: 1,
     username: "exampleUser",
     email: "user@example.com",
     password : "elephant"
   };
// Connect Database
connectDB();

// Fetch JWT secret from environment variables or config file
const jwtSecret = process.env.JWT_SECRET || config.get("jwtSecret");

// Middleware to verify JWT token
app.use((req, res, next) => {
  // Get token from request headers or query parameters or cookies, etc.
  const token = req.headers.authorization;

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      // Token is valid, store decoded data in request object for further processing
      req.user = decoded;
      next();
    }
  });
});

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use("/api/users", require("./Routes/users"));

// Root route
app.get("/", (req, res) => res.send("API Running for token number : " + jwtSecret));

app.post("/api/auth/login", (req, res) => {
     // Validate user credentials (e.g., check against database)
     const { username, password } = req.body;
   
     // For demonstration purposes, simply validate against mock user data
     if (username === mockUser.username && password === "password") {
       // Generate JWT token
       const token = jwt.sign({ id: mockUser.id }, jwtSecret, { expiresIn: "1h" });
   
       res.json({ token });
     } else {
       res.status(401).json({ message: "Invalid credentials" });
     }
   });

   app.get("/api/protected", (req, res) => {
     res.json({ message: "This is a protected route", user: req.user });
   });

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
