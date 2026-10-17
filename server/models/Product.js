const mongoose = require("mongoose");
// Ek size ka stock, jaise { size: "M", stock: 5 }
const sizeStockSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    // Dropdown menu ke liye, jaise "Embroidered - 2 Piece" ya "Chiffon" (optional)
    subCategory: {
      type: String,
      default: "",
      trim: true,
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

    // Product ki tafseel (detail page par dikhti hai)
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Main photo ke ilawa extra photos
    images: {
      type: [String],
      default: [],
    },

    // Available sizes, jaise ["S", "M", "L", "XL"]. Khali ho to size chunna nahi padta
    sizes: {
      type: [String],
      default: [],
    },

    // Har size ka alag stock. Khali ho to stock ginti nahi hoti (sirf inStock chalta hai)
    stockBySize: {
      type: [sizeStockSchema],
      default: [],
    },

    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Product",
  productSchema
);