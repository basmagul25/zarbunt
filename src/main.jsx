import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import "./index.css";
import "./responsive.css";

import { CartProvider } from "./CartContext.jsx";
import { WishlistProvider } from "./WishlistContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>

    <CartProvider>

      <WishlistProvider>

        <App />

      </WishlistProvider>

    </CartProvider>

  </StrictMode>
);