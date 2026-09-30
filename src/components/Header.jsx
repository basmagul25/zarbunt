import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 5 5" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5.5 20c.8-3.3 3-5 6.5-5s5.7 1.7 6.5 5" />
  </svg>
);

const HeartIcon = ({ filled = false }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={filled ? "filled" : ""}>
    <path d="M20.8 8.7c0 5-8.8 10.1-8.8 10.1S3.2 13.7 3.2 8.7A4.6 4.6 0 0 1 12 6.3a4.6 4.6 0 0 1 8.8 2.4Z" />
  </svg>
);

const BagIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 8.5h14l-1 12H6l-1-12Z" />
    <path d="M9 9V6.5a3 3 0 0 1 6 0V9" />
  </svg>
);

function Header({
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onOpenMenu,
  onOpenAccount,
}) {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="mobile-menu-trigger"
          onClick={onOpenMenu}
          aria-label="Open menu"
        >
          <span></span><span></span><span></span>
        </button>

        <button
          className="header-shop-link"
          onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
        >
          SHOP
        </button>
      </div>

      <button
        className="logo logo-button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="The Fabric Store home"
      >
        <span>THE FABRIC</span>
        <strong>STORE</strong>
      </button>

      <div className="header-right">
        <button className="icon-btn" onClick={onOpenSearch} aria-label="Search">
          <SearchIcon />
        </button>

        <button
          className="icon-btn icon-with-count"
          onClick={onOpenWishlist}
          aria-label="Wishlist"
        >
          <HeartIcon />
          {wishlistCount > 0 && <span className="header-count">{wishlistCount}</span>}
        </button>

        <button className="icon-btn desktop-account" onClick={onOpenAccount} aria-label="Account">
          <UserIcon />
        </button>

        <button
          className="icon-btn icon-with-count"
          onClick={onOpenCart}
          aria-label="Shopping bag"
        >
          <BagIcon />
          {cartCount > 0 && <span className="header-count">{cartCount}</span>}
        </button>
      </div>
    </header>
  );
}

export default Header;
