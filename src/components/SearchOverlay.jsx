import { useState } from "react";

import products from "../data/products";

function SearchOverlay({
  isOpen,
  onClose,
}) {
  const [searchTerm, setSearchTerm] =
    useState("");

  if (!isOpen) {
    return null;
  }

  const searchText =
    searchTerm.trim().toLowerCase();

  const filteredProducts =
    products.filter((product) => {
      if (!searchText) {
        return true;
      }

      return (
        product.name
          .toLowerCase()
          .includes(searchText) ||
        product.category
          .toLowerCase()
          .includes(searchText) ||
        product.badge
          ?.toLowerCase()
          .includes(searchText)
      );
    });

  const openProduct = (
    product
  ) => {
    window.dispatchEvent(
      new CustomEvent(
        "openProductDetails",
        {
          detail: product,
        }
      )
    );

    onClose();
  };

  return (
    <div className="search-overlay">
      <div className="search-container">
        {/* TOP */}

        <div className="search-top">
          <p className="search-label">
            SEARCH THE COLLECTION
          </p>

          <button
            className="search-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* SEARCH INPUT */}

        <div className="search-input-wrapper">
          <span>⌕</span>

          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Search fabrics, collections..."
          />
        </div>

        {/* RESULTS */}

        <div className="search-results">
          {searchTerm === "" ? (
            <div className="search-message">
              <p>
                Search for your next
                favourite fabric.
              </p>
            </div>
          ) : filteredProducts.length ===
            0 ? (
            <div className="search-message">
              <h3>
                No products found
              </h3>

              <p>
                Try searching for another
                fabric or collection.
              </p>
            </div>
          ) : (
            <>
              <p className="results-count">
                {filteredProducts.length}{" "}
                PRODUCTS FOUND
              </p>

              <div className="search-products">
                {filteredProducts.map(
                  (product) => (
                    <button
                      className="search-product"
                      key={product.id}
                      onClick={() =>
                        openProduct(
                          product
                        )
                      }
                    >
                      <div
                        className={`search-product-art ${product.artClass}`}
                      >
                        <span>
                          {product.initial}
                        </span>
                      </div>

                      <div className="search-product-info">
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
                      </div>
                    </button>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchOverlay;