function MenuDrawer({
  isOpen,
  onClose,
  onCategorySelect,
}) {
  const menuItems = [
    "New Arrivals",
    "Unstitched",
    "Ready To Wear",
    "Formal",
    "Shawl",
    "Sale",
  ];

  return (
    <>
      {isOpen && (
        <div
          className="menu-overlay"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`menu-drawer ${
          isOpen
            ? "menu-open"
            : ""
        }`}
      >
        {/* HEADER */}

        <div className="menu-header">
          <div>
            <p className="menu-label">
              THE COLLECTION
            </p>

            <h2>
              Explore
            </h2>
          </div>

          <button
            className="menu-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* LINKS */}

        <nav className="menu-links">
          {menuItems.map(
            (item, index) => (
              <button
                key={item}
                onClick={() =>
                  onCategorySelect(
                    item
                  )
                }
              >
                <span>
                  {String(
                    index + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </span>

                {item}

                <strong>
                  →
                </strong>
              </button>
            )
          )}
        </nav>

        {/* BOTTOM */}

        <div className="menu-bottom">
          <p>
            Discover thoughtfully
            selected fabrics,
            contemporary styles and
            timeless textures.
          </p>

          <div className="menu-bottom-links">
            <button
              onClick={onClose}
            >
              CONTACT
            </button>

            <button
              onClick={onClose}
            >
              FAQ
            </button>

            <button
              onClick={onClose}
            >
              INSTAGRAM
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default MenuDrawer;