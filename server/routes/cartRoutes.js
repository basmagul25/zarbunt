const express = require("express");
const Cart = require("../models/Cart");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHENTICATED USER CART
|--------------------------------------------------------------------------
*/

// Get logged-in user's cart
router.get("/user/current", protect, async (req, res) => {
  try {
    const sessionId = `user_${req.user._id}`;

    const cart = await Cart.findOne({
      sessionId,
      userId: req.user._id,
    });

    if (!cart) {
      return res.json({
        sessionId,
        userId: req.user._id,
        items: [],
      });
    }

    res.json(cart);
  } catch (error) {
    console.error("User cart fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch user cart",
      error: error.message,
    });
  }
});

// Save logged-in user's cart
router.put("/user/current", protect, async (req, res) => {
  try {
    const { items } = req.body;

    const sessionId = `user_${req.user._id}`;

    const cart = await Cart.findOneAndUpdate(
      {
        sessionId,
        userId: req.user._id,
      },
      {
        sessionId,
        userId: req.user._id,
        items: items || [],
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.json(cart);
  } catch (error) {
    console.error("User cart save error:", error);

    res.status(500).json({
      message: "Failed to save user cart",
      error: error.message,
    });
  }
});

// Delete logged-in user's cart
router.delete("/user/current", protect, async (req, res) => {
  try {
    const sessionId = `user_${req.user._id}`;

    await Cart.findOneAndDelete({
      sessionId,
      userId: req.user._id,
    });

    res.json({
      message: "User cart deleted successfully",
    });
  } catch (error) {
    console.error("User cart delete error:", error);

    res.status(500).json({
      message: "Failed to delete user cart",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| GUEST CART
|--------------------------------------------------------------------------
*/

// Get guest cart
router.get("/:sessionId", async (req, res) => {
  try {
    const cart = await Cart.findOne({
      sessionId: req.params.sessionId,
    });

    if (!cart) {
      return res.json({
        sessionId: req.params.sessionId,
        items: [],
      });
    }

    res.json(cart);
  } catch (error) {
    console.error("Guest cart fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch cart",
      error: error.message,
    });
  }
});

// Save guest cart
router.put("/:sessionId", async (req, res) => {
  try {
    const { items } = req.body;

    const cart = await Cart.findOneAndUpdate(
      {
        sessionId: req.params.sessionId,
      },
      {
        sessionId: req.params.sessionId,
        items: items || [],
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.json(cart);
  } catch (error) {
    console.error("Guest cart save error:", error);

    res.status(500).json({
      message: "Failed to save cart",
      error: error.message,
    });
  }
});

// Delete guest cart
router.delete("/:sessionId", async (req, res) => {
  try {
    await Cart.findOneAndDelete({
      sessionId: req.params.sessionId,
    });

    res.json({
      message: "Cart deleted successfully",
    });
  } catch (error) {
    console.error("Guest cart delete error:", error);

    res.status(500).json({
      message: "Failed to delete cart",
      error: error.message,
    });
  }
});

module.exports = router;