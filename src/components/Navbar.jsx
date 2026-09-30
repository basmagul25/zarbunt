function Navbar({ onCategorySelect }) {
  const menuItems = [
    ["New Arrivals", "NEW IN"],
    ["Unstitched", "UNSTITCHED"],
    ["Ready To Wear", "PRET"],
    ["Formal", "FORMAL"],
    ["Shawl", "SHAWLS"],
    ["Sale", "SALE"],
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-shop-label">
          <span></span>
          SHOP
        </div>

        <div className="navbar-links">
          {menuItems.map(([value, label]) => (
            <button
              key={value}
              className={`navbar-link ${value === "Sale" ? "sale-link" : ""}`}
              onClick={() => onCategorySelect(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          className="navbar-view-all"
          onClick={() => onCategorySelect("New Arrivals")}
        >
          VIEW ALL <span>→</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
