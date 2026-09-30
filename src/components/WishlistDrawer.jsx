import { useWishlist } from "../WishlistContext";
import { useCart } from "../CartContext";

function WishlistDrawer({
  isOpen,
  onClose,
  onOpenCart,
}) {
  const {
    wishlist,
    toggleWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  const moveToCart = (product) => {
    addToCart(product);
    toggleWishlist(product);
    onClose();

    if (onOpenCart) {
      setTimeout(() => {
        onOpenCart();
      }, 200);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="wishlist-overlay"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`wishlist-drawer ${
          isOpen ? "wishlist-open" : ""
        }`}
      >
        <div className="wishlist-header">
          <div>
            <p className="wishlist-label">
              SAVED PIECES
            </p>

            <h2>
              Wishlist ({wishlist.length})
            </h2>
          </div>

          <button
            className="wishlist-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="wishlist-content">
          {wishlist.length === 0 ? (
            <div className="empty-wishlist">
              <div className="empty-wishlist-icon">
                ♡
              </div>

              <h3>
                Your wishlist is empty
              </h3>

              <p>
                Save the pieces you love and
                find them here whenever you're
                ready.
              </p>

              <button
                className="continue-wishlist"
                onClick={onClose}
              >
                EXPLORE COLLECTION
              </button>
            </div>
          ) : (
            <div className="wishlist-items">
              {wishlist.map((product) => (
                <article
                  className="wishlist-item"
                  key={product.id}
                >
                  <div
                    className={`wishlist-item-image ${product.artClass}`}
                  >
                    <span>
                      {product.initial}
                    </span>
                  </div>

                  <div className="wishlist-item-info">
                    <p>
                      {product.category}
                    </p>

                    <h3>
                      {product.name}
                    </h3>

                    <strong>
                      Rs.{" "}
                      {product.price.toLocaleString()}
                    </strong>

                    <div className="wishlist-item-actions">
                      <button
                        onClick={() =>
                          moveToCart(product)
                        }
                      >
                        ADD TO CART
                      </button>

                      <button
                        className="wishlist-remove"
                        onClick={() =>
                          toggleWishlist(product)
                        }
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default WishlistDrawer;