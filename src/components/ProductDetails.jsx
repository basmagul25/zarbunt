import {
  useEffect,
  useState,
} from "react";

import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";

function ProductDetails({
  product,
  isOpen,
  onClose,
  onBuyNow,
}) {
  const { addToCart } =
    useCart();

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const [quantity, setQuantity] =
    useState(1);

  /* Reset quantity every time
     another product is opened */

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [product, isOpen]);

  if (
    !product ||
    !isOpen
  ) {
    return null;
  }

  const liked =
    isInWishlist(product.id);

  /* --------------------------------
     QUANTITY
  -------------------------------- */

  const increaseQuantity = () => {
    setQuantity(
      (current) =>
        current + 1
    );
  };

  const decreaseQuantity = () => {
    setQuantity(
      (current) =>
        current > 1
          ? current - 1
          : 1
    );
  };

  /* --------------------------------
     ADD SELECTED QUANTITY
  -------------------------------- */

  const addProductToCart =
    () => {
      for (
        let i = 0;
        i < quantity;
        i++
      ) {
        addToCart(product);
      }
    };

  /* --------------------------------
     ADD TO CART
  -------------------------------- */

  const handleAddToCart =
    () => {
      addProductToCart();
    };

  /* --------------------------------
     BUY NOW
  -------------------------------- */

  const handleBuyNow =
    () => {
      addProductToCart();

      onClose();

      if (onBuyNow) {
        onBuyNow();
      }
    };

  return (
    <div
      className="product-details-overlay"
      onClick={onClose}
    >
      <div
        className="product-details-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* CLOSE */}

        <button
          className="product-details-close"
          onClick={onClose}
          aria-label="Close product details"
        >
          ×
        </button>

        <div className="product-details-layout">
          {/* IMAGE */}

          <div className="product-details-image">
            <div
              className={`product-details-art ${product.artClass}`}
            >
              <span>
                {product.initial}
              </span>
            </div>

            {product.badge && (
              <span
                className={`product-details-badge ${
                  product.badge.toLowerCase() ===
                  "sale"
                    ? "details-sale-badge"
                    : ""
                }`}
              >
                {product.badge}
              </span>
            )}
          </div>

          {/* INFORMATION */}

          <div className="product-details-info">
            <p className="product-details-category">
              {product.category}
            </p>

            <h2>
              {product.name}
            </h2>

            <div className="details-price">
              <strong>
                Rs.{" "}
                {product.price.toLocaleString()}
              </strong>

              {product.oldPrice && (
                <span>
                  Rs.{" "}
                  {product.oldPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className="details-divider"></div>

            <p className="details-description">
              Thoughtfully selected fabric
              with a refined texture and
              contemporary finish. Designed
              for effortless styling and
              everyday elegance.
            </p>

            {/* QUANTITY */}

            <div className="quantity-section">
              <p>QUANTITY</p>

              <div className="details-quantity">
                <button
                  onClick={
                    decreaseQuantity
                  }
                >
                  −
                </button>

                <span>
                  {quantity}
                </span>

                <button
                  onClick={
                    increaseQuantity
                  }
                >
                  +
                </button>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="details-actions">
              <button
                className="details-add-cart"
                onClick={
                  handleAddToCart
                }
              >
                ADD TO CART
              </button>

              <button
                className="details-buy-now"
                onClick={
                  handleBuyNow
                }
              >
                BUY NOW →
              </button>
            </div>

            {/* WISHLIST */}

            <button
              className={`details-wishlist ${
                liked
                  ? "details-wishlist-active"
                  : ""
              }`}
              onClick={() =>
                toggleWishlist(product)
              }
            >
              {liked
                ? "♥"
                : "♡"}

              <span>
                {liked
                  ? "REMOVE FROM WISHLIST"
                  : "ADD TO WISHLIST"}
              </span>
            </button>

            {/* FEATURES */}

            <div className="details-features">
              <div>
                <strong>
                  DELIVERY
                </strong>

                <span>
                  Nationwide delivery
                  across Pakistan
                </span>
              </div>

              <div>
                <strong>
                  QUALITY
                </strong>

                <span>
                  Carefully selected
                  premium fabrics
                </span>
              </div>

              <div>
                <strong>
                  SHOPPING
                </strong>

                <span>
                  COD available across
                  Pakistan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;