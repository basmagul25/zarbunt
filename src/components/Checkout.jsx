import { useEffect, useRef, useState } from "react";
import { useAuth } from "../AuthContext";
import { useCart } from "../useCart";
import { calculateShipping } from "../shippingConfig";
import { API_BASE } from "../apiConfig";
import "./Checkout.css";

const API_URL = API_BASE;

function Checkout({ onBack }) {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState("COD");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState(null);

    /*
    Safepay se wapas aane par:
    URL ke ?payment=...&order=... ko padhna aur payment verify karna
  */
  const [paymentReturn, setPaymentReturn] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const orderId = params.get("order")?.split("?")[0];

    if (!payment || !orderId) return null;

    return {
      status: payment === "success" ? "checking" : "cancelled",
      orderId,
    };
  });

  const verifyStartedRef = useRef(false);

  useEffect(() => {
    if (!paymentReturn || paymentReturn.status !== "checking") return;
    if (verifyStartedRef.current) return;
    verifyStartedRef.current = true;

    const { orderId } = paymentReturn;

    const verifyPayment = async () => {
      try {
        const token = localStorage.getItem("fabricStoreToken");

        if (!token) {
          throw new Error("Please sign in again to confirm your payment.");
        }

        // Safepay kabhi kabhi late update karta hai, isliye 6 dafa try
        for (let attempt = 0; attempt < 6; attempt++) {
          const res = await fetch(
            `${API_URL}/api/payments/safepay/verify/${orderId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Unable to verify payment.");
          }

          if (data.paid) {
            clearCart();
            localStorage.removeItem("safepayTrackerToken");
            localStorage.removeItem("safepayOrderId");
            window.history.replaceState(null, "", window.location.pathname);
            setPaymentReturn({ status: "paid", orderId });
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        setPaymentReturn({ status: "pending", orderId });
      } catch (err) {
        setPaymentReturn({
          status: "error",
          orderId,
          message: err.message,
        });
      }
    };

    verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const shipping = calculateShipping(subtotal);

  const total = subtotal + shipping;

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  setError("");
  setSubmitting(true);

  try {
    const token = localStorage.getItem(
      "fabricStoreToken"
    );

    if (!token) {
      throw new Error(
        "Please sign in before placing your order."
      );
    }

    if (cart.length === 0) {
      throw new Error(
        "Your cart is empty."
      );
    }

    /*
      STEP 1
      Create the order in our backend.
    */

    const response = await fetch(
      `${API_URL}/api/orders`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size || "",
          })),

          shippingAddress: form,

          paymentMethod,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to place order."
      );
    }

    /*
      ------------------------------------------------
      CASH ON DELIVERY
      ------------------------------------------------
    */

    if (paymentMethod === "COD") {
      clearCart();

      setSuccess(data.order);

      return;
    }

    /*
      ------------------------------------------------
      CARD PAYMENT
      ------------------------------------------------

      For CARD we DO NOT clear the cart yet.

      First we create the Safepay checkout.
    */

    if (paymentMethod === "CARD") {
      const paymentResponse = await fetch(
        `${API_URL}/api/payments/safepay/create`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            orderId: data.order._id,
          }),
        }
      );

      const paymentData =
        await paymentResponse.json();

      console.log(
        "Safepay create response:",
        paymentData
      );

      if (!paymentResponse.ok) {
        throw new Error(
          paymentData.message ||
            "Unable to create Safepay checkout."
        );
      }

      if (!paymentData.checkoutUrl) {
        throw new Error(
          "Safepay checkout URL was not returned."
        );
      }

      /*
        Save tracker temporarily.

        We will need it later when Safepay
        redirects the customer back.
      */

      if (paymentData.trackerToken) {
        localStorage.setItem(
          "safepayTrackerToken",
          paymentData.trackerToken
        );
      }

      localStorage.setItem(
        "safepayOrderId",
        data.order._id
      );

      /*
        NOW redirect the customer to Safepay.
      */

      window.location.href =
        paymentData.checkoutUrl;

      return;
    }
  } catch (error) {
    console.error(
      "Checkout error:",
      error
    );

    setError(
      error.message ||
        "Something went wrong."
    );
  } finally {
    setSubmitting(false);
  }
};
      
  if (paymentReturn) {
    const closePaymentReturn = () => {
      window.history.replaceState(null, "", window.location.pathname);
      setPaymentReturn(null);
    };

    const screens = {
      checking: {
        mark: "…",
        eyebrow: "VERIFYING PAYMENT",
        title: "Please wait",
        text: "We are confirming your payment with Safepay. Please do not close this page.",
      },
      paid: {
        mark: "✓",
        eyebrow: "PAYMENT RECEIVED",
        title: "Thank you for your order.",
        text: "Your payment was successful and your order is confirmed.",
      },
      pending: {
        mark: "!",
        eyebrow: "PAYMENT PENDING",
        title: "We could not confirm it yet.",
        text: "If money was deducted, your order will be updated shortly. Please check again in a moment.",
      },
      cancelled: {
        mark: "✕",
        eyebrow: "PAYMENT CANCELLED",
        title: "Payment was cancelled.",
        text: "Your cart is safe. You can try again whenever you are ready.",
      },
      error: {
        mark: "!",
        eyebrow: "SOMETHING WENT WRONG",
        title: "We could not verify your payment.",
        text: paymentReturn.message || "Please try again.",
      },
    };

    const screen = screens[paymentReturn.status];

    return (
      <main className="checkout-page">
        <div className="order-success">
          <div className="success-mark">{screen.mark}</div>

          <p className="checkout-eyebrow">{screen.eyebrow}</p>

          <h1>{screen.title}</h1>

          <p>{screen.text}</p>

          <div className="success-order-box">
            <span>ORDER NUMBER</span>
            <strong>{paymentReturn.orderId}</strong>
          </div>

          {paymentReturn.status === "paid" && (
            <button className="checkout-place-btn" onClick={onBack}>
              CONTINUE SHOPPING →
            </button>
          )}

          {paymentReturn.status === "pending" && (
            <button
              className="checkout-place-btn"
              onClick={() => window.location.reload()}
            >
              CHECK AGAIN
            </button>
          )}

          {paymentReturn.status === "cancelled" && (
            <button className="checkout-place-btn" onClick={closePaymentReturn}>
              TRY AGAIN
            </button>
          )}

          {paymentReturn.status === "error" && (
            <button className="checkout-place-btn" onClick={onBack}>
              BACK TO SHOP
            </button>
          )}
        </div>
      </main>
    );
  }
    
  if (!user) {
    return (
      <main className="checkout-page">
        <div className="checkout-login-required">
          <p className="checkout-eyebrow">
            CHECKOUT
          </p>

          <h1>
            Sign in to continue
          </h1>

          <p>
            Please sign in to your account
            before placing an order.
          </p>

          <button
            className="checkout-back-btn"
            onClick={onBack}
          >
            ← BACK TO SHOP
          </button>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="checkout-page">
        <div className="order-success">
          <div className="success-mark">
            ✓
          </div>

          <p className="checkout-eyebrow">
            ORDER CONFIRMED
          </p>

          <h1>
            Thank you for your order.
          </h1>

          <p>
            Your order has been placed
            successfully.
          </p>

          <div className="success-order-box">
            <span>
              ORDER NUMBER
            </span>

            <strong>
              {success._id}
            </strong>
          </div>

          <div className="success-order-box">
            <span>
              TOTAL
            </span>

            <strong>
              Rs.{" "}
              {Number(
                success.total
              ).toLocaleString()}
            </strong>
          </div>

          <button
            className="checkout-place-btn"
            onClick={onBack}
          >
            CONTINUE SHOPPING →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">

        {/* TOP */}

        <div className="checkout-top">
          <button
            className="checkout-back"
            onClick={onBack}
          >
            ← BACK TO CART
          </button>

          <p className="checkout-eyebrow">
            ZARBUNT
          </p>

          <span className="checkout-secure">
            SECURE CHECKOUT
          </span>
        </div>

        <div className="checkout-heading">
          <p className="checkout-eyebrow">
            COMPLETE YOUR ORDER
          </p>

          <h1>
            Checkout
          </h1>
        </div>

        {error && (
          <div className="checkout-error">
            {error}
          </div>
        )}

        <div className="checkout-layout">

          {/* FORM */}

          <form
            className="checkout-form"
            onSubmit={handleSubmit}
          >
            <section className="checkout-card">
              <div className="checkout-card-heading">
                <span>01</span>

                <div>
                  <p>
                    DELIVERY DETAILS
                  </p>

                  <h2>
                    Where should we
                    deliver?
                  </h2>
                </div>
              </div>

              <div className="checkout-fields">

                <label>
                  FULL NAME

                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </label>

                <label>
                  PHONE NUMBER

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="03XX XXXXXXX"
                    required
                  />
                </label>

              
            <label className="field-full">
              EMAIL ADDRESS

              <input
                type="email"
                name="email"
                value={user?.email || ""}
                placeholder="Your account email"
                readOnly
                required
              />
            </label>

                <label className="field-full">
                  ADDRESS

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House number, street, area"
                    rows="4"
                    required
                  />
                </label>

                <label>
                  CITY

                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Islamabad"
                    required
                  />
                </label>

                <label>
                  POSTAL CODE

                  <input
                    type="text"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    placeholder="44000"
                  />
                </label>

              </div>
            </section>

            <section className="checkout-card">
              <div className="checkout-card-heading">
                <span>02</span>

                <div>
                  <p>
                    PAYMENT
                  </p>

                  <h2>
                    Choose payment
                  </h2>
                </div>
              </div>

              <div className="payment-options">

  <label
    className={`payment-option ${
      paymentMethod === "COD"
        ? "selected"
        : ""
    }`}
  >
    <input
      type="radio"
      name="payment"
      value="COD"
      checked={
        paymentMethod === "COD"
      }
      onChange={(event) =>
        setPaymentMethod(
          event.target.value
        )
      }
    />

    <div>
      <strong>
        Cash on Delivery
      </strong>

      <span>
        Pay when your order arrives.
      </span>
    </div>
  </label>

  <label
    className={`payment-option ${
      paymentMethod === "CARD"
        ? "selected"
        : ""
    }`}
  >
    <input
      type="radio"
      name="payment"
      value="CARD"
      checked={
        paymentMethod === "CARD"
      }
      onChange={(event) =>
        setPaymentMethod(
          event.target.value
        )
      }
    />

    <div>
      <strong>
        Credit / Debit Card
      </strong>

      <span>
        Visa, Mastercard and other
        supported cards.
      </span>
    </div>
  </label>

</div>

            </section>

            <button
              type="submit"
              className="checkout-place-btn"
              disabled={submitting}
            >
              {submitting
                ? "PLACING ORDER..."
                : "PLACE ORDER →"}
            </button>
          </form>

          {/* ORDER SUMMARY */}

          <aside className="checkout-summary">
            <div className="checkout-summary-header">
              <p>
                YOUR ORDER
              </p>

              <span>
                {cart.length}{" "}
                {cart.length === 1
                  ? "ITEM"
                  : "ITEMS"}
              </span>
            </div>

            <div className="checkout-summary-items">
              {cart.map((item) => (
                <div
                  className="checkout-summary-item"
                  key={`${item.productId}-${item.size || ""}`}
                >
                  <div className="checkout-summary-image">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    ) : (
                      <span>
                        {item.initial}
                      </span>
                    )}
                  </div>

                  <div className="checkout-summary-info">
                    <h3>
                      {item.name}
                    </h3>

                    <span>
                      Qty: {item.quantity}
                      {item.size
                        ? ` · Size: ${item.size}`
                        : ""}
                    </span>
                  </div>

                  <strong>
                    Rs.{" "}
                    {(
                      Number(item.price) *
                      Number(item.quantity)
                    ).toLocaleString()}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-summary-total">
              <div>
                <span>
                  SUBTOTAL
                </span>

                <strong>
                  Rs.{" "}
                  {subtotal.toLocaleString()}
                </strong>
              </div>

              <div>
                <span>
                  SHIPPING
                </span>

                <strong>
                  {shipping === 0
                    ? "FREE"
                    : `Rs. ${shipping.toLocaleString()}`}
                </strong>
              </div>

              <div className="checkout-grand-total">
                <span>
                  TOTAL
                </span>

                <strong>
                  Rs.{" "}
                  {total.toLocaleString()}
                </strong>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}

export default Checkout;