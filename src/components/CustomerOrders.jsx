import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import "./CustomerOrders.css";
import { API_BASE } from "../apiConfig";

const API_URL = API_BASE + "/api/orders";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_LABELS = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatPrice(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getOrderId(order) {
  return String(order._id || "");
}

function CustomerOrders({ onBack }) {
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const loadOrders = useCallback(async (isRefresh = false) => {
    const token = localStorage.getItem("fabricStoreToken");

    if (!token) {
      setOrders([]);
      setLoading(false);
      setRefreshing(false);
      setError("Please sign in to view your orders.");
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your orders.");
      }

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from the server.");
      }

      setOrders(data);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setOrders([]);
      setLoading(false);
      setError("Please sign in to view your orders.");
      return;
    }

    loadOrders();
  }, [user, authLoading, loadOrders]);

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  // Customer apna order khud cancel kare
  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    const token = localStorage.getItem("fabricStoreToken");

    setCancellingId(orderId);

    try {
      const response = await fetch(`${API_URL}/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to cancel this order.");
      }

      await loadOrders(true);

      window.alert(data.message || "Your order has been cancelled.");
    } catch (err) {
      window.alert(
        err.message || "Could not cancel the order. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading) {
    return (
      <main className="customer-orders-page">
        <p className="orders-loading">Checking your account...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="customer-orders-page">
        <section className="orders-empty">
          <span className="orders-empty-icon">♙</span>
          <h1>Sign in to view your orders</h1>
          <p>
            Your order history and delivery updates will appear here
            after you sign in.
          </p>
          {onBack && (
            <button className="orders-primary-btn" onClick={onBack}>
              Back to store
            </button>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="customer-orders-page">
      <div className="customer-orders-container">
        <header className="customer-orders-header">
          <div>
            <span className="orders-eyebrow">YOUR ACCOUNT</span>
            <h1>My Orders</h1>
            <p>
              Welcome back, {user.name || "Customer"}. Track your
              purchases and delivery progress.
            </p>
          </div>

          <div className="orders-header-actions">
            <button
              className="orders-refresh-btn"
              type="button"
              onClick={() => loadOrders(true)}
              disabled={loading || refreshing}
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>

            {onBack && (
              <button
                className="orders-back-btn"
                type="button"
                onClick={onBack}
              >
                ← Back to store
              </button>
            )}
          </div>
        </header>

        <section className="orders-summary">
          <div className="orders-summary-card">
            <span>Total orders</span>
            <strong>{orders.length}</strong>
          </div>

          <div className="orders-summary-card">
            <span>In progress</span>
            <strong>
              {
                orders.filter((order) =>
                  ["pending", "confirmed", "shipped"].includes(
                    order.status
                  )
                ).length
              }
            </strong>
          </div>

          <div className="orders-summary-card">
            <span>Delivered</span>
            <strong>
              {
                orders.filter((order) => order.status === "delivered")
                  .length
              }
            </strong>
          </div>
        </section>

        <section className="orders-list-section">
          <div className="orders-list-heading">
            <div>
              <span className="orders-eyebrow">ORDER HISTORY</span>
              <h2>Your purchases</h2>
            </div>

            <label className="orders-filter-label">
              <span>Filter</span>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="all">All orders</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && (
            <div className="orders-message orders-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={() => loadOrders()}>
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="orders-loading">
              <span className="orders-loader" />
              <p>Loading your orders...</p>
            </div>
          ) : !error && filteredOrders.length === 0 ? (
            <div className="orders-empty">
              <span className="orders-empty-icon">▧</span>
              <h3>
                {orders.length === 0
                  ? "No orders yet"
                  : "No orders in this category"}
              </h3>
              <p>
                {orders.length === 0
                  ? "When you place an order, its details and tracking status will appear here."
                  : "Choose another status to see your orders."}
              </p>

              {orders.length === 0 && onBack && (
                <button
                  className="orders-primary-btn"
                  onClick={onBack}
                >
                  Explore the collection
                </button>
              )}
            </div>
          ) : (
            <div className="customer-orders-list">
              {filteredOrders.map((order) => {
                const orderId = getOrderId(order);
                const status = ORDER_STATUSES.includes(order.status)
                  ? order.status
                  : "pending";
                const isExpanded = expandedOrder === orderId;

                return (
                  <article className="customer-order-card" key={orderId}>
                    <div className="customer-order-top">
                      <div className="customer-order-number">
                        <span>ORDER NUMBER</span>
                        <strong>#{orderId.slice(-8).toUpperCase()}</strong>
                        <small>Placed {formatDate(order.createdAt)}</small>
                      </div>

                      <span
                        className={`order-status-badge status-${status}`}
                      >
                        <span className="status-dot" />
                        {STATUS_LABELS[status]}
                      </span>
                    </div>

                    <div className="customer-order-overview">
                      <div>
                        <span className="order-detail-label">
                          ITEMS
                        </span>
                        <strong>
                          {order.items?.reduce(
                            (total, item) =>
                              total + Number(item.quantity || 0),
                            0
                          ) || 0}{" "}
                          item(s)
                        </strong>
                      </div>

                      <div>
                        <span className="order-detail-label">
                          PAYMENT
                        </span>
                        <strong>
                          {order.paymentMethod === "COD"
                            ? "Cash on Delivery"
                            : order.paymentMethod === "CARD"
                              ? "Card"
                              : order.paymentMethod || "—"}
                        </strong>
                      </div>

                      <div>
                        <span className="order-detail-label">
                          ORDER TOTAL
                        </span>
                        <strong className="order-total">
                          {formatPrice(order.total)}
                        </strong>
                      </div>
                    </div>

                    <div className="order-tracking">
                      {status === "cancelled" ? (
                        <div className="tracking-cancelled">
                          <span>×</span>
                          <p>
                            This order has been cancelled. Contact
                            customer support if you need assistance.
                          </p>
                        </div>
                      ) : (
                        <div className="tracking-steps">
                          {[
                            "pending",
                            "confirmed",
                            "shipped",
                            "delivered",
                          ].map((step, index) => {
                            const sequence = [
                              "pending",
                              "confirmed",
                              "shipped",
                              "delivered",
                            ];
                            const currentIndex = sequence.indexOf(status);
                            const complete = index <= currentIndex;

                            return (
                              <div
                                className={`tracking-step ${
                                  complete ? "is-complete" : ""
                                }`}
                                key={step}
                              >
                                <span className="tracking-step-icon">
                                  {complete ? "✓" : index + 1}
                                </span>
                                <span className="tracking-step-label">
                                  {STATUS_LABELS[step]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {["pending", "confirmed"].includes(status) &&
                      (order.paymentMethod === "CARD" &&
                      order.paymentStatus === "paid" ? (
                        <p className="order-cancel-note">
                          This order was paid by card. To cancel it, please
                          contact our support team.
                        </p>
                      ) : (
                        <button
                          type="button"
                          className="order-cancel-btn"
                          disabled={cancellingId === orderId}
                          onClick={() => handleCancel(orderId)}
                        >
                          {cancellingId === orderId
                            ? "Cancelling..."
                            : "Cancel this order"}
                        </button>
                      ))}

                    <button
                      type="button"
                      className="order-details-toggle"
                      onClick={() =>
                        setExpandedOrder(isExpanded ? null : orderId)
                      }
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? "Hide details" : "View order details"}
                      <span>{isExpanded ? "−" : "+"}</span>
                    </button>

                    {isExpanded && (
                      <div className="order-expanded-details">
                        <h3>Items in this order</h3>

                        <div className="order-items-list">
                          {(order.items || []).map((item, index) => (
                            <div
                              className="order-item-row"
                              key={`${item.productId || item.name}-${index}`}
                            >
                              {item.image ? (
                                <img
                                  className="order-item-image"
                                  src={item.image}
                                  alt={item.name || "Ordered fabric"}
                                  loading="lazy"
                                />
                              ) : (
                                <div className="order-item-image order-item-placeholder">
                                  FS
                                </div>
                              )}

                              <div className="order-item-info">
                                <strong>{item.name || "Product"}</strong>
                                <span>
                                  Quantity: {item.quantity}
                                  {item.size
                                    ? ` · Size: ${item.size}`
                                    : ""}
                                </span>
                              </div>

                              <strong className="order-item-price">
                                {formatPrice(
                                  Number(item.price) *
                                    Number(item.quantity)
                                )}
                              </strong>
                            </div>
                          ))}
                        </div>

                        <div className="order-cost-breakdown">
                          <div>
                            <span>Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                          </div>
                          <div>
                            <span>Shipping</span>
                            <span>{formatPrice(order.shipping)}</span>
                          </div>
                          <div className="order-grand-total">
                            <strong>Total</strong>
                            <strong>{formatPrice(order.total)}</strong>
                          </div>
                        </div>

                        {order.shippingAddress && (
                          <div className="order-shipping-address">
                            <h3>Delivery address</h3>
                            <p>
                              <strong>
                                {order.shippingAddress.fullName}
                              </strong>
                              <br />
                              {order.shippingAddress.address}
                              <br />
                              {order.shippingAddress.city}
                              {order.shippingAddress.postalCode
                                ? `, ${order.shippingAddress.postalCode}`
                                : ""}
                              <br />
                              {order.shippingAddress.phone}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default CustomerOrders;