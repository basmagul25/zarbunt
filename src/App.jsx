import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

import AnnouncementBar from "./components/AnnouncementBar";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CategorySection from "./components/CategorySection";
import ProductSection from "./components/ProductSection";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

import CartDrawer from "./components/CartDrawer";
import WishlistDrawer from "./components/WishlistDrawer";
import SearchOverlay from "./components/SearchOverlay";
import MenuDrawer from "./components/MenuDrawer";
import AccountDrawer from "./components/AccountDrawer";
import Checkout from "./components/Checkout";
import AdminDashboard from "./components/AdminDashboard";
import CustomerOrders from "./components/CustomerOrders";
import PolicyPage from "./components/PolicyPage";

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [accountOpen, setAccountOpen] = useState(
    () => new URLSearchParams(window.location.search).has("reset")
  );

  const [checkoutOpen, setCheckoutOpen] = useState(
    () => new URLSearchParams(window.location.search).has("payment")
  );

  const [adminOpen, setAdminOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [policyPage, setPolicyPage] = useState(null);
  const { user } = useAuth();

  const closeAllPanels = () => {
    setCartOpen(false);
    setWishlistOpen(false);
    setSearchOpen(false);
    setMenuOpen(false);
    setAccountOpen(false);
    setCheckoutOpen(false);
    setOrdersOpen(false);
  };

  const openPanel = (panel) => {
    closeAllPanels();

    if (panel === "cart") setCartOpen(true);
    if (panel === "wishlist") setWishlistOpen(true);
    if (panel === "search") setSearchOpen(true);
    if (panel === "menu") setMenuOpen(true);
    if (panel === "account") setAccountOpen(true);
  };

  const handleCategorySelect = (category) => {
    window.dispatchEvent(
      new CustomEvent("changeProductCategory", {
        detail: category,
      })
    );

    closeAllPanels();

    setTimeout(() => {
      document
        .getElementById("products")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 80);
  };

  const openCheckout = () => {
    closeAllPanels();
    setAdminOpen(false);
    setCheckoutOpen(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openAdmin = () => {
    closeAllPanels();
    setCheckoutOpen(false);
    setAdminOpen(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const closeAdmin = () => {
    setAdminOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openOrders = () => {
    closeAllPanels();
    setAdminOpen(false);
    setCheckoutOpen(false);
    setOrdersOpen(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const closeOrders = () => {
    setOrdersOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openPolicy = (page) => {
    closeAllPanels();
    setAdminOpen(false);
    setPolicyPage(page);

    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  };

  useEffect(() => {
    const panelOpen =
      cartOpen ||
      wishlistOpen ||
      searchOpen ||
      menuOpen ||
      accountOpen;

    document.body.style.overflow = panelOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [
    cartOpen,
    wishlistOpen,
    searchOpen,
    menuOpen,
    accountOpen,
  ]);

  useEffect(() => {
    if (adminOpen || checkoutOpen) {
      document.body.style.overflow = "";

      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    }
  }, [adminOpen, checkoutOpen]);

  /* Alag alag pages: har ek apna if hai, koi kisi ke andar nahi */

  if (policyPage) {
    return (
      <PolicyPage
        page={policyPage}
        onNavigate={setPolicyPage}
        onBack={() => setPolicyPage(null)}
      />
    );
  }

  if (adminOpen) {
    return (
      <AdminDashboard onBack={closeAdmin} />
    );
  }

  if (ordersOpen) {
    return (
      <CustomerOrders onBack={closeOrders} />
    );
  }

  if (checkoutOpen) {
    return (
      <Checkout
        onBack={() => setCheckoutOpen(false)}
      />
    );
  }

  return (
    <>
      <AnnouncementBar />

      <Header
        onOpenCart={() => openPanel("cart")}
        onOpenWishlist={() => openPanel("wishlist")}
        onOpenSearch={() => openPanel("search")}
        onOpenMenu={() => openPanel("menu")}
        onOpenAccount={() => openPanel("account")}
        onOpenAdmin={openAdmin}
      />

      <Navbar
        onCategorySelect={handleCategorySelect}
      />

      <main>
        <Hero />

        <section id="collections">
          <CategorySection />
        </section>

        <ProductSection
          onOpenCart={() => openPanel("cart")}
        />

        <section
          className="editorial-banner"
          aria-label="Winter collection"
        >
          <div className="editorial-copy">
            <span>THE WINTER EDIT · 26</span>

            <h2>
              Layers made
              <br />
              for quiet luxury.
            </h2>

            <p>
              Rich textures, warm neutrals
              and statement shawls designed
              for the season ahead.
            </p>

            <button
              onClick={() =>
                handleCategorySelect("Shawl")
              }
            >
              SHOP SHAWLS <span>→</span>
            </button>
          </div>

          <div className="editorial-art">
            <div className="editorial-circle" />
            <div className="editorial-fabric" />
            <span>W / 26</span>
          </div>
        </section>

        <Newsletter />
      </main>

      <Footer
        onOpenPolicy={openPolicy}
        onCategorySelect={handleCategorySelect}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={openCheckout}
      />

      <WishlistDrawer
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        onOpenCart={() => openPanel("cart")}
      />

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <MenuDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onCategorySelect={handleCategorySelect}
      />

      <AccountDrawer
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
        onOpenOrders={openOrders}
      />
    </>
  );
}

export default App;