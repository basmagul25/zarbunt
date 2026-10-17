import { useRef, useState } from "react";

/*
  ------------------------------------------------------------------
  MENU DATA
  Yahin se poora dropdown menu banta hai. Naam ya options badalne ho
  to sirf yahan edit karo.

  value ka format:  "Category"  ya  "Category::Sub option"
  ------------------------------------------------------------------
*/

// Aisa column jisme heading bhi clickable hai aur neeche "Heading - option" milta hai
// jaise: Embroidered -> 2 Piece, 3 Piece
const group = (category, title, items) => ({
  title,
  value: `${category}::${title}`,
  links: items.map((item) => ({
    label: item,
    value: `${category}::${title} - ${item}`,
  })),
});

// Aisa column jisme sirf seedhe options hain (heading clickable nahi)
const flat = (category, title, items) => ({
  title,
  links: items.map((item) => ({
    label: item,
    value: `${category}::${item}`,
  })),
});

const MENU = [
  {
    value: "New Arrivals",
    label: "NEW IN",
    columns: [
      {
        title: "Shop New In",
        links: [
          { label: "Unstitched", value: "New Arrivals::Unstitched" },
          { label: "Ready To Wear", value: "New Arrivals::Ready To Wear" },
          { label: "Formal", value: "New Arrivals::Formal" },
          { label: "Shawls", value: "New Arrivals::Shawl" },
        ],
      },
    ],
  },
  {
    value: "Unstitched",
    label: "UNSTITCHED",
    columns: [
      group("Unstitched", "Embroidered", ["2 Piece", "3 Piece"]),
      group("Unstitched", "Printed", ["1 Piece", "2 Piece", "3 Piece"]),
      group("Unstitched", "Printed & Embroidered", ["2 Piece", "3 Piece"]),
    ],
  },
  {
    value: "Ready To Wear",
    label: "PRET",
    columns: [
      group("Ready To Wear", "Embroidered", ["1 Piece", "2 Piece", "3 Piece"]),
      group("Ready To Wear", "Printed", ["1 Piece", "2 Piece", "3 Piece"]),
      group("Ready To Wear", "Printed & Embroidered", ["2 Piece", "3 Piece"]),
      group("Ready To Wear", "Solid", ["2 Piece"]),
    ],
  },
  {
    value: "Formal",
    label: "FORMAL",
    columns: [flat("Formal", "By Fabric", ["Chiffon", "Net"])],
  },
  {
    value: "Shawl",
    label: "SHAWLS",
    columns: [
      group("Shawl", "Winter", ["Karandi Lawn", "Pashmina", "Velvet", "Wool"]),
      group("Shawl", "Summer", ["Lawn"]),
    ],
  },
  {
    value: "Sale",
    label: "SALE",
    isSale: true,
    columns: [
      {
        title: "Flat Discount",
        links: [
          { label: "40% off or more", value: "Sale::40%" },
          { label: "30% off or more", value: "Sale::30%" },
          { label: "20% off or more", value: "Sale::20%" },
          { label: "10% off or more", value: "Sale::10%" },
        ],
      },
      {
        title: "By Category",
        links: [
          { label: "Unstitched", value: "Sale::Unstitched" },
          { label: "Ready To Wear", value: "Sale::Ready To Wear" },
          { label: "Formal", value: "Sale::Formal" },
          { label: "Shawl", value: "Sale::Shawl" },
        ],
      },
    ],
  },
];

function Navbar({ onCategorySelect }) {
  const [openMenu, setOpenMenu] = useState(null);
  const closeTimer = useRef(null);

  const openNow = (value) => {
    clearTimeout(closeTimer.current);
    setOpenMenu(value);
  };

  // Thodi si der baad band hota hai taake mouse tirchha le jane par menu na ghaib ho
  const closeSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  };

  const choose = (value) => {
    clearTimeout(closeTimer.current);
    setOpenMenu(null);
    onCategorySelect(value);
  };

  return (
    <nav className="navbar" onMouseLeave={closeSoon}>
      <div className="navbar-inner">
        <div className="navbar-shop-label">
          <span></span>
          SHOP
        </div>

        <div className="navbar-links">
          {MENU.map((item) => (
            <div
              key={item.value}
              className={`navbar-item ${
                openMenu === item.value ? "navbar-item-open" : ""
              }`}
              onMouseEnter={() => openNow(item.value)}
            >
              <button
                className={`navbar-link ${item.isSale ? "sale-link" : ""}`}
                onClick={() => choose(item.value)}
                onFocus={() => openNow(item.value)}
                aria-haspopup="true"
                aria-expanded={openMenu === item.value}
              >
                {item.label}
              </button>

              <div
                className={`navbar-mega ${
                  openMenu === item.value ? "navbar-mega-open" : ""
                }`}
                onMouseEnter={() => openNow(item.value)}
              >
                <div className="navbar-mega-inner">
                  {item.columns.map((column) => (
                    <div className="mega-column" key={column.title}>
                      {column.value ? (
                        <button
                          className="mega-heading mega-heading-link"
                          onClick={() => choose(column.value)}
                        >
                          {column.title}
                        </button>
                      ) : (
                        <p className="mega-heading">{column.title}</p>
                      )}

                      <ul>
                        {column.links.map((link) => (
                          <li key={link.value}>
                            <button
                              className="mega-link"
                              onClick={() => choose(link.value)}
                            >
                              {link.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="navbar-view-all"
          onClick={() => choose("New Arrivals")}
        >
          VIEW ALL <span>→</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;