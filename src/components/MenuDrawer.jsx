
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

  const handleSelect = (item) => {
    onCategorySelect(item);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="menu-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`menu-drawer ${
          isOpen ? "menu-open" : ""
        }`}
        aria-hidden={!isOpen}
      >
        <div className="menu-header">
          <div>
            <p className="menu-label">
              THE COLLECTION
            </p>

            <h2>Explore</h2>

            <p className="menu-subtitle">
              Find something made for you.
            </p>
          </div>

          <button
            className="menu-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav
          className="menu-links"
          aria-label="Collections"
        >
          {menuItems.map((item, index) => (
            <button
              className="menu-link"
              key={item}
              onClick={() => handleSelect(item)}
            >
              <span className="menu-link-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="menu-link-name">
                {item}
              </span>

              <span
                className="menu-link-arrow"
                aria-hidden="true"
              >
                →
              </span>
            </button>
          ))}
        </nav>

        <div className="menu-bottom">
          <p>
            Thoughtfully selected fabrics,
            contemporary styles and timeless
            textures for every occasion.
          </p>

          <div className="menu-bottom-links">
            <button onClick={onClose}>
              CONTACT
            </button>

            <button onClick={onClose}>
              FAQ
            </button>

            <button onClick={onClose}>
              INSTAGRAM
            </button>
          </div>

          <span className="menu-copyright">
            ZARBUNT · EST. WITH CARE
          </span>
        </div>
      </aside>
    </>
  );
}

export default MenuDrawer;