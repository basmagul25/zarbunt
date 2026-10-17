import { createContext, useContext, useEffect, useMemo, useState,} from "react";
import { API_BASE } from "./apiConfig";

import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

/* const API_URL = "http://localhost:5000"; */
const API_URL = API_BASE;

function getSessionId() {
  let sessionId = localStorage.getItem(
    "fabricStoreSessionId"
  );

  if (!sessionId) {
    sessionId = crypto.randomUUID();

    localStorage.setItem(
      "fabricStoreSessionId",
      sessionId
    );
  }

  return sessionId;
}

function getLocalCart(cartKey) {
  try {
    const saved = localStorage.getItem(
      `fabricStoreCart_${cartKey}`
    );

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Local cart read error:",
      error
    );

    return [];
  }
}

function saveLocalCart(cartKey, items) {
  try {
    localStorage.setItem(
      `fabricStoreCart_${cartKey}`,
      JSON.stringify(items)
    );
  } catch (error) {
    console.error(
      "Local cart save error:",
      error
    );
  }
}

export function CartProvider({ children }) {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [cart, setCart] = useState([]);

  const [cartLoaded, setCartLoaded] =
    useState(false);

  const [loadedCartKey, setLoadedCartKey] =
    useState(null);

  const [sessionId] = useState(() =>
    getSessionId()
  );

  const userId =
    user?._id ||
    user?.id ||
    null;

  /*
  |--------------------------------------------------------------------------
  | CART KEY
  |--------------------------------------------------------------------------
  */

  const cartKey = useMemo(() => {
    if (authLoading) {
      return null;
    }

    if (userId) {
      return `user_${userId}`;
    }

    return sessionId;
  }, [
    authLoading,
    userId,
    sessionId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | LOAD CART
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      authLoading ||
      !cartKey
    ) {
      return;
    }

    let cancelled = false;

    async function loadCart() {
      setCartLoaded(false);
      setLoadedCartKey(null);

      const localCart =
        getLocalCart(cartKey);

      try {
        let response;

        if (userId) {
          const token =
            localStorage.getItem(
              "fabricStoreToken"
            );

          if (!token) {
            throw new Error(
              "Authentication token missing"
            );
          }

          response = await fetch(
            `${API_URL}/api/cart/user/current`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );
        } else {
          response = await fetch(
            `${API_URL}/api/cart/${sessionId}`
          );
        }

        if (!response.ok) {
          throw new Error(
            "Failed to load cart"
          );
        }

        const data =
          await response.json();

        const serverCart =
          Array.isArray(data.items)
            ? data.items
            : [];

        if (cancelled) {
          return;
        }

        /*
        If MongoDB has products, use MongoDB.
        If MongoDB returns empty but local
        storage has products, use local backup.
        */

        const finalCart =
          serverCart.length > 0
            ? serverCart
            : localCart;

        setCart(finalCart);

        saveLocalCart(
          cartKey,
          finalCart
        );

        setLoadedCartKey(cartKey);
        setCartLoaded(true);
      } catch (error) {
        console.error(
          "Cart loading error:",
          error
        );

        if (!cancelled) {
          setCart(localCart);

          setLoadedCartKey(cartKey);
          setCartLoaded(true);
        }
      }
    }

    loadCart();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    cartKey,
    userId,
    sessionId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | SAVE CART
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      authLoading ||
      !cartLoaded ||
      !cartKey ||
      loadedCartKey !== cartKey
    ) {
      return;
    }

    /*
    Always save locally first.
    */

    saveLocalCart(
      cartKey,
      cart
    );

    async function saveCart() {
      try {
        let response;

        if (userId) {
          const token =
            localStorage.getItem(
              "fabricStoreToken"
            );

          if (!token) {
            return;
          }

          response = await fetch(
            `${API_URL}/api/cart/user/current`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                items: cart,
              }),
            }
          );
        } else {
          response = await fetch(
            `${API_URL}/api/cart/${sessionId}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                items: cart,
              }),
            }
          );
        }

        if (!response.ok) {
          throw new Error(
            "Failed to save cart"
          );
        }
      } catch (error) {
        console.error(
          "Cart saving error:",
          error
        );
      }
    }

    saveCart();
  }, [
    cart,
    cartLoaded,
    loadedCartKey,
    cartKey,
    authLoading,
    userId,
    sessionId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | ADD TO CART
  | Ek hi product alag size mein alag line banata hai (productId + size)
  |--------------------------------------------------------------------------
  */

  const sameLine = (item, productId, size) =>
    item.productId === productId &&
    (item.size || "") === (size || "");

  function addToCart(product, options = {}) {
    const productId =
      product.productId ||
      product._id ||
      product.id;

    if (!productId) {
      console.error(
        "Product ID missing:",
        product
      );

      return;
    }

    const size = options.size ?? product.size ?? "";

    const quantityToAdd = Math.max(
      1,
      Number(options.quantity) || 1
    );

    setCart((currentCart) => {
      const exists = currentCart.some((item) =>
        sameLine(item, productId, size)
      );

      let updatedCart;

      if (exists) {
        updatedCart = currentCart.map((item) =>
          sameLine(item, productId, size)
            ? {
                ...item,
                quantity:
                  item.quantity + quantityToAdd,
              }
            : item
        );
      } else {
        updatedCart = [
          ...currentCart,
          {
            productId,

            name: product.name || "",

            category: product.category || "",

            price: Number(product.price) || 0,

            oldPrice: product.oldPrice ?? null,

            badge: product.badge || "",

            initial: product.initial || "",

            artClass: product.artClass || "",

            image: product.image || "",

            size,

            quantity: quantityToAdd,
          },
        ];
      }

      /*
      Immediately keep local backup.
      */

      if (cartKey) {
        saveLocalCart(cartKey, updatedCart);
      }

      return updatedCart;
    });
  }

  /*
  |--------------------------------------------------------------------------
  | DECREASE
  |--------------------------------------------------------------------------
  */

  function decreaseQuantity(productId, size = "") {
    setCart((currentCart) => {
      const updatedCart = currentCart
        .map((item) =>
          sameLine(item, productId, size)
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0);

      if (cartKey) {
        saveLocalCart(cartKey, updatedCart);
      }

      return updatedCart;
    });
  }

  /*
  |--------------------------------------------------------------------------
  | REMOVE
  |--------------------------------------------------------------------------
  */

  function removeFromCart(productId, size = "") {
    setCart((currentCart) => {
      const updatedCart = currentCart.filter(
        (item) =>
          !sameLine(item, productId, size)
      );

      if (cartKey) {
        saveLocalCart(cartKey, updatedCart);
      }

      return updatedCart;
    });
  }

  /*
  |--------------------------------------------------------------------------
  | CLEAR
  |--------------------------------------------------------------------------
  */

  function clearCart() {
    setCart([]);

    if (cartKey) {
      saveLocalCart(
        cartKey,
        []
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | COUNT
  |--------------------------------------------------------------------------
  */

  const cartCount =
    cart.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity || 0
        ),
      0
    );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        cartLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}

export default CartContext;