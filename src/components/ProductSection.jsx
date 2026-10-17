import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ProductDetails from "./ProductDetails";
import { API_BASE } from "../apiConfig";

const API_URL = API_BASE;

function ProductSection({ onOpenCart }) {
  const [activeCategory, setActiveCategory] =
    useState("New Arrivals");

  // Dropdown menu se chuni hui sub option (jaise "Embroidered - 2 Piece")
  const [activeSubCategory, setActiveSubCategory] =
    useState("");

  // Sort aur price filter
  const [sortBy, setSortBy] = useState("featured");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const categories = [
    "New Arrivals",
    "Unstitched",
    "Ready To Wear",
    "Formal",
    "Shawl",
    "Sale",
  ];

  // Fetch products from backend
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/products`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch products"
          );
        }

        const data = await response.json();

        setProducts(data);
      } catch (error) {
        console.error(
          "Products fetch error:",
          error
        );

        setError(
          "Unable to load products. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Category events
  useEffect(() => {
    const handleCategoryChange = (event) => {
      // detail "Unstitched" ya "Unstitched::Embroidered - 2 Piece" ho sakta hai
      const [category, sub = ""] = String(
        event.detail || ""
      ).split("::");

      if (categories.includes(category)) {
        setActiveCategory(category);
        setActiveSubCategory(sub);
      }
    };

    const handleProductOpen = (event) => {
      setSelectedProduct(event.detail);
    };

    window.addEventListener(
      "changeProductCategory",
      handleCategoryChange
    );

    window.addEventListener(
      "openProductDetails",
      handleProductOpen
    );

    return () => {
      window.removeEventListener(
        "changeProductCategory",
        handleCategoryChange
      );

      window.removeEventListener(
        "openProductDetails",
        handleProductOpen
      );
    };
  }, []);

  // "Embroidered" chunne par "Embroidered" aur "Embroidered - 2 Piece" dono dikhen,
  // lekin "Printed & Embroidered" na dikhe
  const matchesSub = (product, sub) => {
    const value = (product.subCategory || "").toLowerCase();
    const wanted = sub.toLowerCase();

    return (
      value === wanted ||
      value.startsWith(`${wanted} - `)
    );
  };

  const discountOf = (product) =>
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(
          (1 - product.price / product.oldPrice) * 100
        )
      : 0;

  const filterProducts = (category, sub) => {
    if (category === "New Arrivals") {
      const newProducts = products.filter(
        (product) =>
          product.badge?.toLowerCase() ===
          "new"
      );

      return sub
        ? newProducts.filter(
            (product) =>
              product.category?.toLowerCase() ===
              sub.toLowerCase()
          )
        : newProducts;
    }

    if (category === "Sale") {
      const saleProducts = products.filter(
        (product) =>
          product.badge?.toLowerCase() ===
            "sale" ||
          product.oldPrice
      );

      if (!sub) return saleProducts;

      // "40%" jaisi sub option: itne ya zyada discount wale
      if (/^\d+%$/.test(sub)) {
        const minimum = parseInt(sub, 10);

        return saleProducts.filter(
          (product) =>
            discountOf(product) >= minimum
        );
      }

      return saleProducts.filter(
        (product) =>
          product.category?.toLowerCase() ===
          sub.toLowerCase()
      );
    }

    const inCategory = products.filter(
      (product) =>
        product.category?.toLowerCase() ===
        category.toLowerCase()
    );

    return sub
      ? inCategory.filter((product) =>
          matchesSub(product, sub)
        )
      : inCategory;
  };

  const filteredProducts = filterProducts(
    activeCategory,
    activeSubCategory
  );

  // Price range lagao, phir sort karo
  const hasPriceFilter =
    minPrice !== "" || maxPrice !== "";

  const visibleProducts = (() => {
    const min =
      minPrice === "" ? null : Number(minPrice);

    const max =
      maxPrice === "" ? null : Number(maxPrice);

    const list = filteredProducts.filter(
      (product) => {
        const price = Number(product.price) || 0;

        if (min !== null && price < min) {
          return false;
        }

        if (max !== null && price > max) {
          return false;
        }

        return true;
      }
    );

    const sorted = [...list];

    // "featured" = jaisa server se aata hai (naye products pehle)
    if (sortBy === "price-asc") {
      sorted.sort(
        (a, b) => Number(a.price) - Number(b.price)
      );
    }

    if (sortBy === "price-desc") {
      sorted.sort(
        (a, b) => Number(b.price) - Number(a.price)
      );
    }

    if (sortBy === "name") {
      sorted.sort((a, b) =>
        String(a.name).localeCompare(String(b.name))
      );
    }

    return sorted;
  })();

  const selectCategory = (category) => {
    setActiveCategory(category);
    setActiveSubCategory("");

    setTimeout(() => {
      document
        .getElementById("products")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  return (
    <section
      className="products-section"
      id="products"
    >
      <div className="products-heading">
        <div>
          <p className="section-label">
            CURATED FOR YOU
          </p>

          <h2>
            {activeCategory}
            {activeSubCategory &&
              ` · ${activeSubCategory}`}
          </h2>
        </div>

        {!loading && !error && (
          <span>
            {visibleProducts.length} PIECES
          </span>
        )}
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
            onClick={() =>
              selectCategory(category)
            }
          >
            {category}
          </button>
        ))}
      </div>

      {!loading && !error && (
        <div className="products-toolbar">
          <div className="price-filter">
            <span>PRICE (Rs.)</span>

            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minPrice}
              onChange={(event) =>
                setMinPrice(event.target.value)
              }
            />

            <em>–</em>

            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxPrice}
              onChange={(event) =>
                setMaxPrice(event.target.value)
              }
            />

            {hasPriceFilter && (
              <button
                type="button"
                className="toolbar-clear"
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                }}
              >
                CLEAR
              </button>
            )}
          </div>

          <label className="sort-select">
            <span>SORT BY</span>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
            >
              <option value="featured">
                Newest first
              </option>
              <option value="price-asc">
                Price: Low to High
              </option>
              <option value="price-desc">
                Price: High to Low
              </option>
              <option value="name">
                Name: A to Z
              </option>
            </select>
          </label>
        </div>
      )}

      <div className="products-grid">
        {loading ? (
          <div className="no-products">
            <h3>Loading Products...</h3>
            <p>
              Please wait while we load the
              latest collection.
            </p>
          </div>
        ) : error ? (
          <div className="no-products">
            <h3>Unable to Load Products</h3>
            <p>{error}</p>
          </div>
        ) : visibleProducts.length > 0 ? (
          visibleProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onViewProduct={setSelectedProduct}
            />
          ))
        ) : hasPriceFilter &&
          filteredProducts.length > 0 ? (
          <div className="no-products">
            <h3>No pieces in this price range</h3>

            <p>
              Try a different price range or
              clear the filter.
            </p>
          </div>
        ) : (
          <div className="no-products">
            <h3>Coming Soon</h3>

            <p>
              New pieces for this collection
              will be added soon.
            </p>
          </div>
        )}
      </div>

      <div className="products-bottom-link">
        <button
          onClick={() =>
            selectCategory("New Arrivals")
          }
        >
          VIEW ALL PRODUCTS <span>→</span>
        </button>
      </div>

      <ProductDetails
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() =>
          setSelectedProduct(null)
        }
        onBuyNow={() => {
          setSelectedProduct(null);

          setTimeout(() => {
            onOpenCart?.();
          }, 200);
        }}
      />
    </section>
  );
}

export default ProductSection;