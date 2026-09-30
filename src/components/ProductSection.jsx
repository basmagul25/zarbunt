import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ProductDetails from "./ProductDetails";
import products from "../data/products";

function ProductSection({ onOpenCart }) {
  const [activeCategory, setActiveCategory] = useState("New Arrivals");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = [
    "New Arrivals",
    "Unstitched",
    "Ready To Wear",
    "Formal",
    "Shawl",
    "Sale",
  ];

  useEffect(() => {
    const handleCategoryChange = (event) => {
      if (categories.includes(event.detail)) {
        setActiveCategory(event.detail);
      }
    };

    const handleProductOpen = (event) => {
      setSelectedProduct(event.detail);
    };

    window.addEventListener("changeProductCategory", handleCategoryChange);
    window.addEventListener("openProductDetails", handleProductOpen);

    return () => {
      window.removeEventListener("changeProductCategory", handleCategoryChange);
      window.removeEventListener("openProductDetails", handleProductOpen);
    };
  }, []);

  const filterProducts = (category) => {
    if (category === "New Arrivals") {
      return products.filter((product) => product.badge === "NEW");
    }

    if (category === "Sale") {
      return products.filter((product) => product.badge === "SALE" || product.oldPrice);
    }

    return products.filter((product) => product.category === category);
  };

  const filteredProducts = filterProducts(activeCategory);

  const selectCategory = (category) => {
    setActiveCategory(category);
    setTimeout(() => {
      document.getElementById("products")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 30);
  };

  return (
    <section className="products-section" id="products">
      <div className="products-heading">
        <div>
          <p className="section-label">THE LATEST EDIT</p>
          <h2>{activeCategory}</h2>
        </div>

        <div className="products-heading-meta">
          <span>{filteredProducts.length} PIECES</span>
          <button onClick={() => selectCategory("New Arrivals")}>
            VIEW ALL <span>→</span>
          </button>
        </div>
      </div>

      <div className="product-category-nav">
        {categories.map((category) => (
          <button
            key={category}
            className={
              activeCategory === category
                ? "product-category-link active"
                : "product-category-link"
            }
            onClick={() => selectCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewProduct={setSelectedProduct}
            />
          ))
        ) : (
          <div className="no-products">
            <h3>Coming Soon</h3>
            <p>New pieces for this collection will be added soon.</p>
          </div>
        )}
      </div>

      <div className="products-bottom-link">
        <button onClick={() => selectCategory("New Arrivals")}>
          VIEW ALL PRODUCTS <span>→</span>
        </button>
      </div>

      <ProductDetails
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onBuyNow={() => {
          setSelectedProduct(null);
          setTimeout(() => onOpenCart?.(), 200);
        }}
      />
    </section>
  );
}

export default ProductSection;
