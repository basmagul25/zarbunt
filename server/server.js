const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const passwordRoutes = require("./routes/passwordRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Render jaisi hosting proxy ke peeche chalti hai, isliye asli IP padhne ke liye
app.set("trust proxy", 1);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS: sirf apni website ko ijazat.
// FRONTEND_URL mein website ka address likho (kai hon to comma se alag karo).
// FRONTEND_URL khali ho to sab ko ijazat (sirf testing ke liye).
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin || // Postman ya server se server
        /^http:\/\/localhost:\d+$/.test(origin) || // computer par testing
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

// Login, signup aur password reset par bar bar koshish rokne ke liye
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Zarbunt Backend is running successfully!",
  });
});

// API routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", passwordRoutes);

// MongoDB connection
console.log("Connecting to MongoDB...");

console.log(
  "MongoDB URI loaded:",
  Boolean(process.env.MONGO_URI)
);

console.log("Starting MongoDB connection...");

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });