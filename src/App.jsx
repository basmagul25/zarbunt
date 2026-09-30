import { useEffect, useState } from "react";

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

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const closeAllPanels = () => {
    setCartOpen(false);
    setWishlistOpen(false);
    setSearchOpen(false);
    setMenuOpen(false);
    setAccountOpen(false);
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
      document.getElementById("products")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  useEffect(() => {
    const panelOpen =
      cartOpen ||
      wishlistOpen ||
      searchOpen ||
      menuOpen ||
      accountOpen;

    document.body.style.overflow = panelOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, wishlistOpen, searchOpen, menuOpen, accountOpen]);

  return (
    <>
      <AnnouncementBar />

      <Header
        onOpenCart={() => openPanel("cart")}
        onOpenWishlist={() => openPanel("wishlist")}
        onOpenSearch={() => openPanel("search")}
        onOpenMenu={() => openPanel("menu")}
        onOpenAccount={() => openPanel("account")}
      />

      <Navbar onCategorySelect={handleCategorySelect} />

      <main>
        <Hero />

        <section id="collections">
          <CategorySection />
        </section>

        <ProductSection onOpenCart={() => openPanel("cart")} />

        <section className="editorial-banner" aria-label="Winter collection">
          <div className="editorial-copy">
            <span>THE WINTER EDIT · 26</span>
            <h2>Layers made<br />for quiet luxury.</h2>
            <p>
              Rich textures, warm neutrals and statement shawls
              designed for the season ahead.
            </p>
            <button onClick={() => handleCategorySelect("Shawl")}>
              SHOP SHAWLS <span>→</span>
            </button>
          </div>
          <div className="editorial-art">
            <div className="editorial-circle"></div>
            <div className="editorial-fabric"></div>
            <span>W / 26</span>
          </div>
        </section>

        <Newsletter />
      </main>

      <Footer />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
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
      />
    </>
  );
}

export default App;
