const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const { sendPasswordResetEmail } = require("../services/passwordResetEmail");

const router = express.Router();

const RESET_LINK_MINUTES = 30;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD
| Customer email deta hai, hum reset link email karte hain.
| Response hamesha ek jaisa hota hai (email maujood ho ya na ho), taake
| koi ye na pata laga sake ke kaunsi email registered hai.
|--------------------------------------------------------------------------
*/

router.post("/forgot-password", async (req, res) => {
  const genericResponse = {
    message:
      "If an account exists for this email, a password reset link has been sent.",
  };

  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "Please enter your email address.",
      });
    }

    const user = await User.findOne({ email });

    if (!user || user.isActive === false) {
      return res.json(genericResponse);
    }

    // Asli token sirf email mein jata hai, database mein uska hash save hota hai
    const rawToken = crypto.randomBytes(32).toString("hex");

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: hashToken(rawToken),
          passwordResetExpires: new Date(
            Date.now() + RESET_LINK_MINUTES * 60 * 1000
          ),
        },
      }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/?reset=${rawToken}`;

    try {
      await sendPasswordResetEmail({
        user,
        resetLink,
        expiresInMinutes: RESET_LINK_MINUTES,
      });
    } catch (emailError) {
      console.error("Password reset email failed:", emailError.message);
    }

    return res.json(genericResponse);
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| RESET PASSWORD
| Email wale link ke token ke saath naya password set karna.
|--------------------------------------------------------------------------
*/

router.post("/reset-password", async (req, res) => {
  try {
    const token = String(req.body?.token || "");
    const password = String(req.body?.password || "");

    if (!token || !password) {
      return res.status(400).json({
        message: "Reset token and new password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "This reset link is invalid or has expired.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Naya password save karo aur token hamesha ke liye hata do (ek hi baar chalta hai)
    await User.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { passwordResetToken: "", passwordResetExpires: "" },
      }
    );

    return res.json({
      message: "Your password has been reset. You can now sign in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
});

module.exports = router;