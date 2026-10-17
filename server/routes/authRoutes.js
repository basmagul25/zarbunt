const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// CREATE JWT
// ==========================================

function createToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}


// ==========================================
// REGISTER
// POST /api/auth/register
// ==========================================

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // Check existing user
    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "An account with this email already exists",
      });
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
    });

    // Create token
    const token = createToken(user);

    res.status(201).json({
      message:
        "Account created successfully",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    res.status(500).json({
      message:
        "Registration failed",
    });
  }
});


// ==========================================
// LOGIN
// POST /api/auth/login
// ==========================================

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message:
          "Your account has been disabled",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const token =
      createToken(user);

    res.json({
      message:
        "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      message:
        "Login failed",
    });
  }
});


// ==========================================
// CURRENT USER
// GET /api/auth/me
// ==========================================

router.get(
  "/me",
  protect,
  async (req, res) => {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isActive: req.user.isActive,
      },
    });
  }
);


// ==========================================
// LOGOUT
// ==========================================

router.post(
  "/logout",
  protect,
  async (req, res) => {
    res.json({
      message:
        "Logout successful",
    });
  }
);


module.exports = router;