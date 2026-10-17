const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { restoreOrderStock } = require("../services/stockService");
const { sendOrderStatusEmail } = require("../services/orderStatusEmail");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// [{ size: " M ", stock: "5" }] -> [{ size: "M", stock: 5 }]
// (khali size hata kar, ek size sirf ek baar, stock kam az kam 0)
function cleanStock(value) {
  const list = Array.isArray(value) ? value : [];
  const seen = new Set();
  const result = [];

  for (const entry of list) {
    const size = String(entry?.size ?? "").trim();

    if (!size || seen.has(size.toLowerCase())) {
      continue;
    }

    seen.add(size.toLowerCase());

    result.push({
      size,
      stock: Math.max(
        0,
        Math.floor(Number(entry?.stock) || 0)
      ),
    });
  }

  return result;
}

// ["S", " M ", "", "S"] -> ["S", "M"] (khali aur duplicate hata kar)
function cleanList(value) {
  const list = Array.isArray(value) ? value : [];

  return [
    ...new Set(
      list
        .map((item) => String(item).trim())
        .filter(Boolean)
    ),
  ];
}

// All routes below require an authenticated admin.
// GET /api/admin/products
// Get all products
router.get(
  "/products",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const products = await Product.find().sort({
        createdAt: -1,
      });

      res.json(products);
    } catch (error) {
      console.error("Admin fetch products error:", error);

      res.status(500).json({
        message: "Failed to fetch products.",
      });
    }
  }
);

// POST /api/admin/products
// Add a new product
router.post(
  "/products",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const {
        name,
        category,
        subCategory,
        description,
        images,
        sizes,
        stockBySize,
        price,
        oldPrice,
        badge,
        initial,
        artClass,
        image,
        inStock,
      } = req.body;

      if (
        !name?.trim() ||
        !category?.trim() ||
        price === undefined ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0 ||
        !image?.trim()
      ) {
        return res.status(400).json({
          message:
            "Name, category, valid price and image are required.",
        });
      }

      if (
        oldPrice !== undefined &&
        oldPrice !== null &&
        oldPrice !== "" &&
        (!Number.isFinite(Number(oldPrice)) ||
          Number(oldPrice) < 0)
      ) {
        return res.status(400).json({
          message: "Invalid old price.",
        });
      }

      const cleanedStock = cleanStock(stockBySize);

      const product = await Product.create({
        name: name.trim(),
        category: category.trim(),
        subCategory:
          typeof subCategory === "string"
            ? subCategory.trim()
            : "",
        description:
          typeof description === "string"
            ? description.trim()
            : "",
        images: cleanList(images),
        sizes:
          cleanedStock.length > 0
            ? cleanedStock.map((entry) => entry.size)
            : cleanList(sizes),
        stockBySize: cleanedStock,
        price: Number(price),
        oldPrice:
          oldPrice === undefined ||
          oldPrice === null ||
          oldPrice === ""
            ? null
            : Number(oldPrice),
        badge: badge || "",
        initial: initial || "",
        artClass: artClass || "",
        image: image.trim(),
        inStock:
          cleanedStock.length > 0
            ? inStock !== false &&
              cleanedStock.some((entry) => entry.stock > 0)
            : inStock !== false,
      });

      res.status(201).json({
        message: "Product added successfully.",
        product,
      });
    } catch (error) {
      console.error("Admin add product error:", error);

      res.status(500).json({
        message: "Failed to add product.",
      });
    }
  }
);

// PUT /api/admin/products/:id
// Update a product
router.put(
  "/products/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid product ID.",
        });
      }

      const allowedFields = [
        "name",
        "category",
        "subCategory",
        "description",
        "images",
        "sizes",
        "stockBySize",
        "price",
        "oldPrice",
        "badge",
        "initial",
        "artClass",
        "image",
        "inStock",
      ];

      const updates = {};

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          message: "No product changes provided.",
        });
      }

      if (
        updates.name !== undefined &&
        (typeof updates.name !== "string" ||
          !updates.name.trim())
      ) {
        return res.status(400).json({
          message: "Product name is required.",
        });
      }

      if (
        updates.category !== undefined &&
        (typeof updates.category !== "string" ||
          !updates.category.trim())
      ) {
        return res.status(400).json({
          message: "Product category is required.",
        });
      }

      if (updates.name !== undefined) {
        updates.name = updates.name.trim();
      }

      if (updates.category !== undefined) {
        updates.category = updates.category.trim();
      }

      if (updates.subCategory !== undefined) {
        updates.subCategory =
          typeof updates.subCategory === "string"
            ? updates.subCategory.trim()
            : "";
      }

      if (updates.description !== undefined) {
        updates.description =
          typeof updates.description === "string"
            ? updates.description.trim()
            : "";
      }

      if (updates.images !== undefined) {
        updates.images = cleanList(updates.images);
      }

      if (updates.sizes !== undefined) {
        updates.sizes = cleanList(updates.sizes);
      }

      // Stock aaye to sizes usi se bante hain, aur sab sizes ka stock 0 ho to product out of stock
      if (updates.stockBySize !== undefined) {
        updates.stockBySize = cleanStock(updates.stockBySize);

        updates.sizes = updates.stockBySize.map(
          (entry) => entry.size
        );

        if (updates.stockBySize.length > 0) {
          updates.inStock =
            updates.inStock !== false &&
            updates.stockBySize.some(
              (entry) => entry.stock > 0
            );
        }
      }

      if (updates.image !== undefined) {
        if (
          typeof updates.image !== "string" ||
          !updates.image.trim()
        ) {
          return res.status(400).json({
            message: "A valid image URL is required.",
          });
        }

        updates.image = updates.image.trim();
      }

      if (updates.price !== undefined) {
        if (
          updates.price === "" ||
          !Number.isFinite(Number(updates.price)) ||
          Number(updates.price) < 0
        ) {
          return res.status(400).json({
            message: "Invalid product price.",
          });
        }

        updates.price = Number(updates.price);
      }

      if (updates.oldPrice !== undefined) {
        if (
          updates.oldPrice === "" ||
          updates.oldPrice === null
        ) {
          updates.oldPrice = null;
        } else if (
          !Number.isFinite(Number(updates.oldPrice)) ||
          Number(updates.oldPrice) < 0
        ) {
          return res.status(400).json({
            message: "Invalid old price.",
          });
        } else {
          updates.oldPrice = Number(updates.oldPrice);
        }
      }

      if (
        updates.inStock !== undefined &&
        typeof updates.inStock !== "boolean"
      ) {
        return res.status(400).json({
          message: "inStock must be true or false.",
        });
      }

      const product = await Product.findByIdAndUpdate(
        id,
        { $set: updates },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!product) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }

      res.json({
        message: "Product updated successfully.",
        product,
      });
    } catch (error) {
      console.error("Admin update product error:", error);

      res.status(500).json({
        message: "Failed to update product.",
      });
    }
  }
);

// DELETE /api/admin/products/:id
// Delete a product
router.delete(
  "/products/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid product ID.",
        });
      }

      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }

      res.json({
        message: "Product deleted successfully.",
        productId: id,
      });
    } catch (error) {
      console.error("Admin delete product error:", error);

      res.status(500).json({
        message: "Failed to delete product.",
      });
    }
  }
);


/* =========================================
   ADMIN ORDER MANAGEMENT
========================================= */

// GET /api/admin/orders
// Fetch all customer orders
router.get("/orders", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Admin fetch orders error:", error);

    res.status(500).json({
      message: "Failed to fetch orders.",
    });
  }
});

// PATCH /api/admin/orders/:id/status
// Update a customer's order status
router.patch(
  "/orders/:id/status",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid order ID.",
        });
      }

      const allowedStatuses = [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid order status.",
        });
      }

      const existingOrder = await Order.findById(id);

      if (!existingOrder) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      const orderUpdate = { status };

      // Order cancel hone par reserve kiya hua stock wapas aa jata hai
      if (
        status === "cancelled" &&
        existingOrder.status !== "cancelled" &&
        existingOrder.stockReserved
      ) {
        await restoreOrderStock(existingOrder);

        orderUpdate.stockReserved = false;
      }

      const order = await Order.findByIdAndUpdate(
        id,
        { $set: orderUpdate },
        { new: true, runValidators: true }
      ).populate("userId", "name email");

      if (!order) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      // Status badalne par customer ko email (email fail ho to bhi status badal chuka hota hai)
      if (existingOrder.status !== status) {
        try {
          await sendOrderStatusEmail({
            user: order.userId,
            order,
            status,
          });
        } catch (emailError) {
          console.error(
            "Order status email failed:",
            emailError.message
          );
        }
      }

      res.json({
        message: "Order status updated successfully.",
        order,
      });
    } catch (error) {
      console.error("Admin update order status error:", error);

      res.status(500).json({
        message: "Failed to update order status.",
      });
    }
  }
);

module.exports = router;