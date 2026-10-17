const express = require("express");

const router = express.Router();

const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");
const { sendOrderConfirmationEmail } = require("../services/emailService");

const {
  createPaymentSession,
  createAuthenticationToken,
  createCheckoutUrl,
  getPaymentStatus,
} = require("../services/safepayService");

/*
|--------------------------------------------------------------------------
| Create Safepay Checkout
|--------------------------------------------------------------------------
*/
router.post("/safepay/create", protect, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.paymentMethod !== "CARD") {
      return res.status(400).json({
        success: false,
        message: "This order does not require card payment.",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This order is no longer pending.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Step 1: Create Safepay Payment Session
    |--------------------------------------------------------------------------
    */

    const paymentSession = await createPaymentSession({
      amount: order.total,
      orderId: order._id,
    });

    console.log("Safepay payment session:", paymentSession);

    /*
    |--------------------------------------------------------------------------
    | IMPORTANT:
    | Safepay response is:
    |
    | paymentSession.data.tracker.token
    |--------------------------------------------------------------------------
    */

    const trackerToken =
      paymentSession?.data?.tracker?.token;

    if (!trackerToken) {
      throw new Error(
        "Safepay tracker token was not returned."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Save tracker token with order
    |--------------------------------------------------------------------------
    */

    order.paymentTrackerToken = trackerToken;
    order.paymentStatus = "pending";

    await order.save();

    /*
    |--------------------------------------------------------------------------
    | Step 2: Create Safepay Authentication Token
    |--------------------------------------------------------------------------
    */

    const authToken =
      await createAuthenticationToken();

    console.log(
      "Safepay authentication response:",
      authToken
    );

    /*
    |--------------------------------------------------------------------------
    | Safepay node-core responses are wrapped inside data
    |--------------------------------------------------------------------------
    */

    const safepayAuthToken =
      (typeof authToken?.data === "string"
        ? authToken.data
        : undefined) ||
      authToken?.data?.token ||
      authToken?.data?.access_token ||
      authToken?.access_token ||
      authToken?.token;

    if (!safepayAuthToken) {
      throw new Error(
        "Safepay authentication token was not returned."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Step 3: Create Hosted Checkout URL
    |--------------------------------------------------------------------------
    */

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://localhost:5173";

    const redirectUrl =
      `${frontendUrl}/checkout?payment=success&order=${order._id}`;

    const cancelUrl =
      `${frontendUrl}/checkout?payment=cancelled&order=${order._id}`;

    const checkoutUrl =
      await createCheckoutUrl({
        tracker: trackerToken,
        authToken: safepayAuthToken,
        redirectUrl,
        cancelUrl,
      });

    console.log(
      "Safepay checkout URL:",
      checkoutUrl
    );

    if (!checkoutUrl) {
      throw new Error(
        "Safepay checkout URL was not generated."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Send checkout URL to frontend
    |--------------------------------------------------------------------------
    */

    return res.json({
      success: true,
      checkoutUrl,
      trackerToken,
      orderId: order._id,
    });
  } catch (error) {
    console.error(
      "Safepay create checkout error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to create Safepay checkout.",
    });
  }
});


/*
|--------------------------------------------------------------------------
| Check Safepay Payment Status
|--------------------------------------------------------------------------
*/

router.get(
  "/safepay/status/:trackerToken",
  protect,
  async (req, res) => {
    try {
      const { trackerToken } = req.params;

      if (!trackerToken) {
        return res.status(400).json({
          success: false,
          message: "Tracker token is required.",
        });
      }

      const order = await Order.findOne({
        paymentTrackerToken: trackerToken,
        userId: req.user._id,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found.",
        });
      }

      const paymentStatus =
        await getPaymentStatus(trackerToken);

      return res.json({
        success: true,
        payment: paymentStatus,
        orderId: order._id,
      });
    } catch (error) {
      console.error(
        "Safepay status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to fetch payment status.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Verify Safepay Payment by Order ID (marks order as paid)
|--------------------------------------------------------------------------
*/

router.get(
  "/safepay/verify/:orderId",
  protect,
  async (req, res) => {
    try {
      const order = await Order.findOne({
        _id: req.params.orderId,
        userId: req.user._id,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found.",
        });
      }

      if (!order.paymentTrackerToken) {
        return res.status(400).json({
          success: false,
          message: "No Safepay payment was started for this order.",
        });
      }

      // Already paid: nothing more to do
      if (order.paymentStatus === "paid") {
        return res.json({
          success: true,
          paid: true,
          orderId: order._id,
          paymentStatus: order.paymentStatus,
          status: order.status,
        });
      }

      // Ask Safepay (server to server) for the real payment state
      const payment = await getPaymentStatus(
        order.paymentTrackerToken
      );

      // Safepay response: state is at data.state (older format: data.tracker.state)
      const trackerState =
        payment?.data?.state || payment?.data?.tracker?.state;

      // Safepay ki paid amount (paisa mein) order ke total se match honi chahiye
      const paidAmount = Number(
        payment?.data?.purchase_totals?.quote_amount?.amount
      );
      const expectedAmount = Math.round(Number(order.total) * 100);

      // TRACKER_ENDED means the payment was completed successfully
      if (
        trackerState === "TRACKER_ENDED" &&
        paidAmount === expectedAmount
      ) {
        order.paymentStatus = "paid";

        if (order.status === "pending") {
          order.status = "confirmed";
        }

        await order.save();

        // Payment confirm hone par ek dafa email bhejo
        try {
          await sendOrderConfirmationEmail({
            user: req.user,
            order,
          });
        } catch (emailError) {
          console.error(
            "Order confirmation email failed:",
            emailError.message
          );
        }
      }

      return res.json({
        success: true,
        paid: order.paymentStatus === "paid",
        trackerState,
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        status: order.status,
      });
    } catch (error) {
      console.error("Safepay verify error:", error);

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to verify payment.",
      });
    }
  }
);


module.exports = router;