const mongoose = require("mongoose");
const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    oldPrice: {
      type: Number,
      default: null,
    },

    badge: {
      type: String,
      default: "",
    },

    initial: {
      type: String,
      default: "",
    },

    artClass: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    size: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const cartSchema = new mongoose.Schema(
  {
    // Guest cart = random UUID
    // User cart = user_<userId>
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },

    // Logged-in user's account
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", cartSchema);