const express = require("express");

const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const {
  reserveStock,
  releaseStock,
  restoreOrderStock,
} = require("../services/stockService");
const { calculateShipping } = require("../shippingConfig");
const { sendOrderStatusEmail } = require("../services/orderStatusEmail");

const { protect } = require("../middleware/authMiddleware");
const { sendOrderConfirmationEmail } = require("../services/emailService");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
*/

router.post("/", protect, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
    } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Your cart is empty.",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        message:
          "Shipping address is required.",
      });
    }

    const {
      fullName,
      phone,
      address,
      city,
      postalCode,
    } = shippingAddress;

    if (
      !fullName ||
      !phone ||
      !address ||
      !city
    ) {
      return res.status(400).json({
        message:
          "Please complete all required delivery details.",
      });
    }

    if (
      !["COD", "CARD"].includes(
        paymentMethod
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid payment method.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET REAL PRODUCTS FROM MONGODB
    |--------------------------------------------------------------------------
    */

    // Ek hi product alag alag size mein ho sakta hai, isliye duplicate ids hata do
    const productIds = [
      ...new Set(
        items.map((item) => String(item.productId))
      ),
    ];

    const products = await Product.find({
      _id: {
        $in: productIds,
      },
    });

    if (
      products.length !== productIds.length
    ) {
      return res.status(400).json({
        message:
          "One or more products are no longer available.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | BUILD ORDER ITEMS USING DATABASE PRICES
    |--------------------------------------------------------------------------
    */

    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of items) {
      const product = products.find(
        (item) =>
          item._id.toString() ===
          String(cartItem.productId)
      );

      if (!product) {
        return res.status(400).json({
          message:
            "A product in your cart could not be found.",
        });
      }

      const quantity = Number(
        cartItem.quantity
      );

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          message:
            "Invalid product quantity.",
        });
      }

      if (!product.inStock) {
        return res.status(400).json({
          message:
            `${product.name} is currently out of stock.`,
        });
      }

      // Agar product ke sizes hain to customer ko valid size chunna zaroori hai
      const productSizes = Array.isArray(product.sizes)
        ? product.sizes
        : [];

      let size = "";

      if (productSizes.length > 0) {
        const requestedSize = String(
          cartItem.size || ""
        ).trim();

        const matchedSize = productSizes.find(
          (option) =>
            option.toLowerCase() ===
            requestedSize.toLowerCase()
        );

        if (!matchedSize) {
          return res.status(400).json({
            message:
              `Please choose a size for ${product.name}. Remove it from your cart and add it again with a size.`,
          });
        }

        size = matchedSize;
      }

      const itemTotal =
        product.price * quantity;

      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        size,
        image: product.image || "",
      });
    }

    const shipping = calculateShipping(subtotal);
    const total = subtotal + shipping;

    /*
    |--------------------------------------------------------------------------
    | CREATE ORDER
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | STOCK RESERVE
    | Har size ka stock kam hota hai. Stock kam ho to order nahi banta.
    |--------------------------------------------------------------------------
    */

    const stockResult = await reserveStock(orderItems);

    if (!stockResult.ok) {
      return res.status(400).json({
        message: stockResult.message,
      });
    }

    let order;

    try {
      order = await Order.create({
      userId: req.user._id,

      items: orderItems,

      shippingAddress: {
        fullName,
        phone,
        address,
        city,
        postalCode:
          postalCode || "",
      },

      paymentMethod,

      subtotal,
      shipping,
      total,

      status: "pending",

      stockReserved: stockResult.reserved.length > 0,
    });
    } catch (createError) {
      // Order nahi bana to reserve kiya hua stock wapas
      await releaseStock(stockResult.reserved);

      throw createError;
    }

    /*
    |--------------------------------------------------------------------------
    | CLEAR USER CART
    |--------------------------------------------------------------------------
    */

    await Cart.findOneAndDelete({
      sessionId:
        `user_${req.user._id}`,

      userId: req.user._id,
    });

    /*
    |--------------------------------------------------------------------------
    | SEND ORDER CONFIRMATION EMAIL (does not block order success if it fails)
    |--------------------------------------------------------------------------
    */

    let emailSent = false;

    // Card orders ki email payment confirm hone ke baad jayegi
    if (paymentMethod === "COD") {
      try {
        const emailResult = await sendOrderConfirmationEmail({
          user: req.user,
          order,
        });

        emailSent = Boolean(emailResult?.sent);
      } catch (emailError) {
        console.error(
          "Order confirmation email failed:",
          emailError.message
        );
      }
    }

    res.status(201).json({
      message:
        "Order placed successfully.",

      order,
      emailSent,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to place order.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET USER ORDERS
|--------------------------------------------------------------------------
*/

router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (error) {
    console.error(
      "Get orders error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch orders.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| CANCEL ORDER (customer khud)
| Sirf pending ya confirmed order cancel ho sakta hai.
| Card se paid order online cancel nahi hota (refund support se hota hai).
|--------------------------------------------------------------------------
*/

router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        message:
          order.status === "cancelled"
            ? "This order is already cancelled."
            : `This order can no longer be cancelled because it is already ${order.status}.`,
      });
    }

    if (
      order.paymentMethod === "CARD" &&
      order.paymentStatus === "paid"
    ) {
      return res.status(400).json({
        message:
          "This order was paid by card. Please contact our support team to cancel it and arrange a refund.",
      });
    }

    // Reserve kiya hua stock wapas
    if (order.stockReserved) {
      await restoreOrderStock(order);
      order.stockReserved = false;
    }

    order.status = "cancelled";

    if (
      order.paymentMethod === "CARD" &&
      order.paymentStatus === "pending"
    ) {
      order.paymentStatus = "cancelled";
    }

    await order.save();

    try {
      await sendOrderStatusEmail({
        user: req.user,
        order,
        status: "cancelled",
      });
    } catch (emailError) {
      console.error(
        "Order status email failed:",
        emailError.message
      );
    }

    return res.json({
      message: "Your order has been cancelled.",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    return res.status(500).json({
      message: "Failed to cancel order.",
      error: error.message,
    });
  }
});

module.exports = router;