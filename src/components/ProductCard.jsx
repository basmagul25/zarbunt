import { useCart } from "../useCart";
import { useWishlist } from "../WishlistContext";

function ProductCard({
  product,
  onViewProduct,
}) {
  const { addToCart } = useCart();

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const liked = isInWishlist(
    product._id || product.id
  );

  const isSale =
    product.badge?.toLowerCase() ===
      "sale" ||
    Boolean(product.oldPrice);

  const handleCardClick = () => {
    onViewProduct?.(product);
  };

  // Size wale product ka size detail page par chunna hota hai
  const hasSizes =
    Array.isArray(product.sizes) &&
    product.sizes.length > 0;

  // Saare sizes ka stock khatam ho to card par SOLD OUT
  const stockEntries = Array.isArray(product.stockBySize)
    ? product.stockBySize
    : [];

  const soldOut =
    product.inStock === false ||
    (hasSizes &&
      stockEntries.length > 0 &&
      product.sizes.every(
        (option) =>
          (stockEntries.find(
            (entry) => entry.size === option
          )?.stock ?? 1) === 0
      ));

  return (
    <article className={`product-card ${soldOut ? "product-card-soldout" : ""}`}>
      <div
        className="product-image"
        onClick={handleCardClick}
      >
        {product.badge && (
          <span
            className={`product-badge ${
              isSale
                ? "sale-badge"
                : ""
            }`}
          >
            {product.badge}
          </span>
        )}

        <button
          className={`wishlist-btn ${
            liked
              ? "wishlist-active"
              : ""
          }`}
          onClick={(event) => {
            event.stopPropagation();

            toggleWishlist(product);
          }}
          aria-label={
            liked
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          {liked ? "♥" : "♡"}
        </button>

        <div
          className={`product-art ${
            product.artClass || ""
          }`}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />
          ) : (
            <span>
              {product.initial}
            </span>
          )}

          <div className="art-overlay">
            <span>VIEW PIECE</span>
            <strong>→</strong>
          </div>
        </div>
      </div>

      <div className="product-info">
        <p className="product-category">
          {product.category}
        </p>

        <h3
          className="product-title-clickable"
          onClick={handleCardClick}
        >
          {product.name}
        </h3>

        <div className="product-bottom">
          <div className="price-area">
            <p className="product-price">
              Rs.{" "}
              {Number(
                product.price
              ).toLocaleString()}
            </p>

            {product.oldPrice && (
              <p className="product-old-price">
                Rs.{" "}
                {Number(
                  product.oldPrice
                ).toLocaleString()}
              </p>
            )}
          </div>

          <button
            className="quick-add"
            disabled={soldOut}
            onClick={(event) => {
              event.stopPropagation();

              if (hasSizes) {
                handleCardClick();
                return;
              }

              addToCart(product);
            }}
          >
            {soldOut ? "SOLD OUT" : hasSizes ? "SELECT" : "ADD"}{" "}
            {!soldOut && <span>+</span>}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;