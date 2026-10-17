import { useEffect, useMemo, useState } from "react";

import { useCart } from "../useCart";
import { useWishlist } from "../WishlistContext";

const DEFAULT_DESCRIPTION =
  "Thoughtfully selected fabric with a refined texture and contemporary finish. Designed for effortless styling and everyday elegance.";

function ProductDetails({
  product,
  isOpen,
  onClose,
  onBuyNow,
}) {
  const { cart, addToCart } = useCart();

  const { toggleWishlist, isInWishlist } =
    useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [stockMessage, setStockMessage] = useState("");

  /* Main photo + extra photos, duplicate hata kar */

  const gallery = useMemo(() => {
    if (!product) return [];

    const list = [
      product.image,
      ...(Array.isArray(product.images)
        ? product.images
        : []),
    ].filter(Boolean);

    return [...new Set(list)];
  }, [product]);

  const sizes = Array.isArray(product?.sizes)
    ? product.sizes
    : [];

  /* Har nayi product khulne par sab reset */

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSize("");
      setSizeError(false);
      setActiveImage(0);
      setAdded(false);
      setStockMessage("");
    }
  }, [product, isOpen]);

  if (!product || !isOpen) {
    return null;
  }

  const liked = isInWishlist(
    product._id || product.id
  );

  /* Har size ka stock (null = is size ka stock track nahi hota) */

  const stockEntries = Array.isArray(product.stockBySize)
    ? product.stockBySize
    : [];

  const stockOf = (option) => {
    const entry = stockEntries.find(
      (item) => item.size === option
    );

    return entry ? entry.stock : null;
  };

  const allSoldOut =
    sizes.length > 0 &&
    stockEntries.length > 0 &&
    sizes.every((option) => stockOf(option) === 0);

  const outOfStock =
    product.inStock === false || allSoldOut;

  const selectedStock = size ? stockOf(size) : null;

  /* --------------------------------
     QUANTITY
  -------------------------------- */

  const increaseQuantity = () => {
    setQuantity((current) =>
      selectedStock !== null
        ? Math.min(current + 1, selectedStock)
        : current + 1
    );
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      current > 1 ? current - 1 : 1
    );
  };

  /* --------------------------------
     ADD TO CART (size zaroori agar sizes hain)
  -------------------------------- */

  const addProductToCart = () => {
    if (sizes.length > 0 && !size) {
      setSizeError(true);
      return false;
    }

    // Cart mein pehle se jitne hain unko mila kar stock se zyada na ho
    const productId = product._id || product.id;

    const inCart =
      cart.find(
        (item) =>
          item.productId === productId &&
          (item.size || "") === size
      )?.quantity || 0;

    if (
      selectedStock !== null &&
      inCart + quantity > selectedStock
    ) {
      const remaining = selectedStock - inCart;

      setStockMessage(
        remaining > 0
          ? `Only ${remaining} more available in size ${size}.`
          : `You already have all available pieces of size ${size} in your cart.`
      );

      return false;
    }

    setStockMessage("");

    addToCart(product, { size, quantity });

    return true;
  };

  const handleAddToCart = () => {
    if (addProductToCart()) {
      setAdded(true);

      setTimeout(() => setAdded(false), 1800);
    }
  };

  const handleBuyNow = () => {
    if (!addProductToCart()) {
      return;
    }

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
              className={`product-details-art ${
                product.artClass || ""
              }`}
            >
              {gallery.length > 0 ? (
                <img
                  className="details-main-image"
                  src={gallery[activeImage]}
                  alt={product.name}
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <span>{product.initial}</span>
              )}
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

            {gallery.length > 1 && (
              <div className="details-thumbs">
                {gallery.map((src, index) => (
                  <button
                    type="button"
                    key={src}
                    className={`details-thumb ${
                      index === activeImage
                        ? "details-thumb-active"
                        : ""
                    }`}
                    onClick={() =>
                      setActiveImage(index)
                    }
                    aria-label={`View photo ${
                      index + 1
                    }`}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMATION */}

          <div className="product-details-info">
            <p className="product-details-category">
              {product.category}
              {product.subCategory
                ? ` · ${product.subCategory}`
                : ""}
            </p>

            <h2>{product.name}</h2>

            <div className="details-price">
              <strong>
                Rs.{" "}
                {Number(
                  product.price
                ).toLocaleString()}
              </strong>

              {product.oldPrice && (
                <span>
                  Rs.{" "}
                  {Number(
                    product.oldPrice
                  ).toLocaleString()}
                </span>
              )}
            </div>

            <div className="details-divider"></div>

            <p className="details-description">
              {product.description?.trim() ||
                DEFAULT_DESCRIPTION}
            </p>

            {/* SIZE */}

            {sizes.length > 0 && (
              <div className="size-section">
                <div className="size-heading">
                  <p>SIZE</p>

                  {sizeError && (
                    <span className="size-error">
                      Please select a size
                    </span>
                  )}
                </div>

                <div className="size-options">
                  {sizes.map((option) => {
                    const left = stockOf(option);
                    const soldOut = left === 0;

                    return (
                      <button
                        type="button"
                        key={option}
                        disabled={soldOut}
                        title={
                          soldOut
                            ? "Sold out"
                            : undefined
                        }
                        className={`size-option ${
                          size === option
                            ? "size-option-active"
                            : ""
                        } ${
                          soldOut
                            ? "size-option-soldout"
                            : ""
                        }`}
                        onClick={() => {
                          setSize(option);
                          setSizeError(false);
                          setStockMessage("");

                          setQuantity((current) =>
                            left !== null
                              ? Math.min(current, left)
                              : current
                          );
                        }}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {selectedStock !== null &&
                  selectedStock <= 5 && (
                    <p className="stock-note">
                      Only {selectedStock} left in this
                      size
                    </p>
                  )}

                {stockMessage && (
                  <p className="stock-note">
                    {stockMessage}
                  </p>
                )}
              </div>
            )}

            {/* QUANTITY */}

            <div className="quantity-section">
              <p>QUANTITY</p>

              <div className="details-quantity">
                <button onClick={decreaseQuantity}>
                  −
                </button>

                <span>{quantity}</span>

                <button onClick={increaseQuantity}>
                  +
                </button>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="details-actions">
              <button
                className="details-add-cart"
                onClick={handleAddToCart}
                disabled={outOfStock}
              >
                {outOfStock
                  ? "OUT OF STOCK"
                  : added
                  ? "ADDED ✓"
                  : "ADD TO CART"}
              </button>

              <button
                className="details-buy-now"
                onClick={handleBuyNow}
                disabled={outOfStock}
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
              {liked ? "♥" : "♡"}

              <span>
                {liked
                  ? "REMOVE FROM WISHLIST"
                  : "ADD TO WISHLIST"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;