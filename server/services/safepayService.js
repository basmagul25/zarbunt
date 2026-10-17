const safepay = require("@sfpy/node-core")(
  process.env.SAFEPAY_SECRET_KEY,
  {
    authType: "secret",
    host:
      process.env.SAFEPAY_ENV === "production"
        ? "https://api.getsafepay.com"
        : "https://sandbox.api.getsafepay.com",
  }
);

const SAFEPAY_ENV =
  process.env.SAFEPAY_ENV === "production" ? "production" : "sandbox";

async function createPaymentSession({ amount, orderId }) {
  const response = await safepay.payments.session.setup({
    merchant_api_key: process.env.SAFEPAY_API_KEY,

    intent: "CYBERSOURCE",
    mode: "payment",
    entry_mode: "raw",
    currency: "PKR",

    // PKR ko paisa mein convert karke bhej rahe hain
    amount: Math.round(Number(amount) * 100),

    metadata: {
      order_id: String(orderId),
    },

    include_fees: false,
  });

  return response;
}

// SDK 0.3.5 mein token ka method client.passport hai (auth.passport nahi)
// Result shape: { data: "<token>" }
async function createAuthenticationToken() {
  return await safepay.client.passport.create();
}

// SDK 0.3.5 mein checkout URL ka method checkout.createCheckoutUrl hai
// (checkouts.payment.create nahi). Ye env leta hai, baaki params query string mein jaate hain.
async function createCheckoutUrl({
  tracker,
  authToken,
  redirectUrl,
  cancelUrl,
}) {
  // paymentRoutes se string aaye ya poora response object, dono chalenge
  const trackerToken =
    typeof tracker === "string" ? tracker : tracker?.data?.tracker?.token;

  const tbt = typeof authToken === "string" ? authToken : authToken?.data;

  if (!trackerToken || !tbt) {
    throw new Error("Safepay checkout needs both tracker token and auth token.");
  }

  return safepay.checkout.createCheckoutUrl({
    env: SAFEPAY_ENV,
    tracker: trackerToken,
    tbt,
    source: "hosted",
    redirect_url: redirectUrl,
    cancel_url: cancelUrl,
  });
}

async function getPaymentStatus(trackerToken) {
  const response = await safepay.reporter.payments.fetch(trackerToken);

  return response;
}

module.exports = {
  createPaymentSession,
  createAuthenticationToken,
  createCheckoutUrl,
  getPaymentStatus,
};