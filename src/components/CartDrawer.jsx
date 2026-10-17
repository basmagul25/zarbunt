import { useCart } from "../useCart";

function CartDrawer({
  isOpen,
  onClose,
  onCheckout,
}) {
  const {
    cart,
    cartCount,
    addToCart,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const handleCheckout = () => {
    if (cart.length === 0) {
      return;
    }

    onClose();

    if (onCheckout) {
      setTimeout(() => {
        onCheckout();
      }, 150);
    }
  };

  return (
    <>
      {/* OVERLAY */}

      {isOpen && (
        <div
          className="cart-overlay"
          onClick={onClose}
        ></div>
      )}

      {/* DRAWER */}

      <aside
        className={`cart-drawer ${
          isOpen ? "cart-open" : ""
        }`}
      >
        {/* HEADER */}

        <div className="cart-header">
          <div>
            <p className="cart-label">
              YOUR SHOPPING BAG
            </p>

            <h2>
              Cart ({cartCount})
            </h2>
          </div>

          <button
            className="cart-close"
            onClick={onClose}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {/* CONTENT */}

        <div className="cart-content">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">
                🛒
              </div>

              <h3>
                Your cart is empty
              </h3>

              <p>
                Discover something beautiful
                and add it to your collection.
              </p>

              <button
                className="continue-shopping"
                onClick={onClose}
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            <div className="cart-items">
              {cart.map((item) => (
                <div
                  className="cart-item"
                  key={`${item.productId}-${item.size || ""}`}
                >
                  {/* PRODUCT IMAGE */}

                  <div
                    className={`cart-item-image ${
                      item.artClass || ""
                    }`}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                      />
                    ) : (
                      <span>
                        {item.initial}
                      </span>
                    )}
                  </div>

                  {/* PRODUCT INFO */}

                  <div className="cart-item-info">
                    <p className="cart-item-category">
                      {item.category}
                    </p>

                    <h3>
                      {item.name}
                    </h3>

                    {item.size && (
                      <p className="cart-item-size">
                        Size: {item.size}
                      </p>
                    )}

                    <p className="cart-item-price">
                      Rs.{" "}
                      {Number(
                        item.price
                      ).toLocaleString()}
                    </p>

                    {/* QUANTITY */}

                    <div className="cart-item-bottom">
                      <div className="quantity-controls">
                        <button
                          onClick={() =>
                            decreaseQuantity(
                              item.productId,
                              item.size
                            )
                          }
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <span>
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            addToCart(item)
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* REMOVE */}

                      <button
                        className="remove-item"
                        onClick={() =>
                          removeFromCart(
                            item.productId,
                            item.size
                          )
                        }
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="subtotal-row">
              <span>
                SUBTOTAL
              </span>

              <strong>
                Rs.{" "}
                {subtotal.toLocaleString()}
              </strong>
            </div>

            <p className="cart-note">
              Shipping and taxes calculated
              at checkout.
            </p>

            <button
              className="checkout-btn"
              onClick={handleCheckout}
            >
              PROCEED TO CHECKOUT →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;