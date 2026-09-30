import { useCart } from "../CartContext";
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

  const liked = isInWishlist(product.id);

  const isSale =
    product.badge?.toLowerCase() === "sale" ||
    product.oldPrice;

  const handleCardClick = () => {
    if (onViewProduct) {
      onViewProduct(product);
    }
  };

  return (
    <article className="product-card">

      <div
        className="product-image"
        onClick={handleCardClick}
      >

        {product.badge && (
          <span
            className={`product-badge ${
              isSale ? "sale-badge" : ""
            }`}
          >
            {product.badge}
          </span>
        )}

        <button
          className={`wishlist-btn ${
            liked ? "wishlist-active" : ""
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
          className={`product-art ${product.artClass}`}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
            />
          ) : (
            <span>{product.initial}</span>
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
              {product.price.toLocaleString()}
            </p>

            {product.oldPrice && (
              <p className="product-old-price">
                Rs.{" "}
                {product.oldPrice.toLocaleString()}
              </p>
            )}

          </div>

          <button
            className="quick-add"
            onClick={(event) => {
              event.stopPropagation();
              addToCart(product);
            }}
          >
            ADD <span>+</span>
          </button>

        </div>

      </div>

    </article>
  );
}

export default ProductCard;