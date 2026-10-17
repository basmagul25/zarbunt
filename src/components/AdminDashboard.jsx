import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { API_BASE } from "../apiConfig";
import "./AdminDashboard.css";

const API_URL = API_BASE + "/api/admin";

// Navbar ke dropdown menu ke options ke saath match hone chahiye (suggestions ke liye)
const SUB_CATEGORY_OPTIONS = {
  Unstitched: [
    "Embroidered - 2 Piece",
    "Embroidered - 3 Piece",
    "Printed - 1 Piece",
    "Printed - 2 Piece",
    "Printed - 3 Piece",
    "Printed & Embroidered - 2 Piece",
    "Printed & Embroidered - 3 Piece",
  ],
  "Ready To Wear": [
    "Embroidered - 1 Piece",
    "Embroidered - 2 Piece",
    "Embroidered - 3 Piece",
    "Printed - 1 Piece",
    "Printed - 2 Piece",
    "Printed - 3 Piece",
    "Printed & Embroidered - 2 Piece",
    "Printed & Embroidered - 3 Piece",
    "Solid - 2 Piece",
  ],
  Formal: ["Chiffon", "Net"],
  Shawl: [
    "Winter - Karandi Lawn",
    "Winter - Pashmina",
    "Winter - Velvet",
    "Winter - Wool",
    "Summer - Lawn",
  ],
};

// Product ke sizes aur stock ko form ki rows mein badalna
function stockRowsFromProduct(product) {
  if (
    Array.isArray(product.stockBySize) &&
    product.stockBySize.length > 0
  ) {
    return product.stockBySize.map((entry) => ({
      size: entry.size,
      stock: String(entry.stock),
    }));
  }

  return (product.sizes || []).map((size) => ({
    size,
    stock: "0",
  }));
}

const emptyProduct = {
  name: "",
  category: "",
  subCategory: "",
  description: "",
  images: "",
  stockRows: [],
  price: "",
  oldPrice: "",
  badge: "",
  image: "",
  initial: "",
  artClass: "",
  inStock: true,
};

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

function formatPrice(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function AdminDashboard({ onBack }) {
  const { user, loading } = useAuth();

  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState(emptyProduct);

  // Jo category likhi hai uske hisaab se sub category ke suggestions
  const subCategorySuggestions =
    Object.entries(SUB_CATEGORY_OPTIONS).find(
      ([name]) =>
        name.toLowerCase() ===
        String(form.category || "").trim().toLowerCase()
    )?.[1] || [];

  // Sizes aur stock ki rows
  const updateStockRow = (index, field, value) => {
    setForm((current) => ({
      ...current,
      stockRows: current.stockRows.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      ),
    }));
  };

  const addStockRow = () => {
    setForm((current) => ({
      ...current,
      stockRows: [
        ...current.stockRows,
        { size: "", stock: "" },
      ],
    }));
  };

  const removeStockRow = (index) => {
    setForm((current) => ({
      ...current,
      stockRows: current.stockRows.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const addStandardSizes = () => {
    setForm((current) => {
      const have = new Set(
        current.stockRows.map((row) =>
          String(row.size).trim().toLowerCase()
        )
      );

      const extra = ["S", "M", "L", "XL"]
        .filter((size) => !have.has(size.toLowerCase()))
        .map((size) => ({ size, stock: "0" }));

      return {
        ...current,
        stockRows: [...current.stockRows, ...extra],
      };
    });
  };
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isAdmin = user?.role === "admin";

  const request = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem("fabricStoreToken");

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }

    return data;
  }, []);

  const loadProducts = useCallback(async () => {
    const data = await request("/products");
    setProducts(data);
  }, [request]);

  const loadOrders = useCallback(async () => {
    const data = await request("/orders");
    setOrders(data);
  }, [request]);

  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;

    async function loadDashboard() {
      try {
        setError("");

        const [productResult, orderResult] = await Promise.allSettled([
          request("/products"),
          request("/orders"),
        ]);

        if (cancelled) return;

        if (productResult.status === "fulfilled") {
          setProducts(productResult.value);
        } else {
          setError(
            productResult.reason?.message ||
              "Could not load products."
          );
        }

        if (orderResult.status === "fulfilled") {
          setOrders(orderResult.value);
        } else {
          setError((current) =>
            [
              current,
              orderResult.reason?.message || "Could not load orders.",
            ]
              .filter(Boolean)
              .join(" ")
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load dashboard.");
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, request]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function startEdit(product) {
    setEditingId(product._id);

    setForm({
      name: product.name || "",
      category: product.category || "",
      subCategory: product.subCategory || "",
      description: product.description || "",
      images: (product.images || []).join("\n"),
      stockRows: stockRowsFromProduct(product),
      price: String(product.price ?? ""),
      oldPrice:
        product.oldPrice == null ? "" : String(product.oldPrice),
      badge: product.badge || "",
      image: product.image || "",
      initial: product.initial || "",
      artClass: product.artClass || "",
      inStock: product.inStock !== false,
    });

    setMessage("");
    setError("");
    setActiveTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm({ ...emptyProduct });
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        oldPrice: form.oldPrice === "" ? null : Number(form.oldPrice),
        images: String(form.images || "")
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean),
        stockBySize: (form.stockRows || [])
          .map((row) => ({
            size: String(row.size || "").trim(),
            stock: Math.max(
              0,
              Math.floor(Number(row.stock) || 0)
            ),
          }))
          .filter((row) => row.size),
      };

      if (editingId) {
        await request(`/products/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        setMessage("Product updated successfully.");
      } else {
        await request("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setMessage("Product added successfully.");
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStock(product) {
    setError("");
    setMessage("");

    try {
      await request(`/products/${product._id}`, {
        method: "PUT",
        body: JSON.stringify({ inStock: !product.inStock }),
      });

      setMessage("Stock status updated.");
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}" permanently?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await request(`/products/${product._id}`, {
        method: "DELETE",
      });

      if (editingId === product._id) resetForm();

      setMessage("Product deleted successfully.");
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateOrderStatus(order, status) {
    if (order.status === status) return;

    setUpdatingOrderId(order._id);
    setError("");
    setMessage("");

    try {
      const data = await request(`/orders/${order._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setOrders((current) =>
        current.map((item) =>
          item._id === order._id
            ? { ...item, ...(data.order || {}), status }
            : item
        )
      );

      setMessage(`Order status changed to ${status}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  }

  if (loading) {
    return <main className="admin-page">Loading account...</main>;
  }

  if (!user) {
    return (
      <main className="admin-page">
        <h1>Please sign in first.</h1>
        <button onClick={onBack}>Back to store</button>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="admin-page">
        <h1>Access denied</h1>
        <p>This dashboard is only available to administrators.</p>
        <button onClick={onBack}>Back to store</button>
      </main>
    );
  }

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredOrders = orders.filter((order) => {
    const customer = order.shippingAddress?.fullName || order.userId?.name || "";
    const email = order.userId?.email || "";
    const id = order._id || "";
    const query = orderSearch.toLowerCase();

    const matchesSearch = `${customer} ${email} ${id}`
      .toLowerCase()
      .includes(query);

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const totalRevenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">ZARBUNT · MANAGEMENT</span>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user.name}. Manage your store in one place.</p>
        </div>

        <button className="admin-back-btn" onClick={onBack}>
          ← Back to store
        </button>
      </header>

      <section className="admin-stats">
        <div>
          <span>Total products</span>
          <strong>{products.length}</strong>
        </div>
        <div>
          <span>Total orders</span>
          <strong>{orders.length}</strong>
        </div>
        <div>
          <span>Pending orders</span>
          <strong>{pendingOrders}</strong>
        </div>
        <div>
          <span>Order value*</span>
          <strong>{formatPrice(totalRevenue)}</strong>
        </div>
      </section>

      <p className="admin-note">
        *Order value excludes cancelled orders; it is not a record of
        confirmed payments.
      </p>

      <nav className="admin-tabs" aria-label="Admin sections">
        <button
          type="button"
          className={activeTab === "products" ? "active" : ""}
          onClick={() => {
            setActiveTab("products");
            setError("");
            setMessage("");
          }}
        >
          Products
        </button>
        <button
          type="button"
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => {
            setActiveTab("orders");
            setError("");
            setMessage("");
          }}
        >
          Orders ({orders.length})
        </button>
      </nav>

      {error && <p className="admin-alert admin-error">{error}</p>}
      {message && <p className="admin-alert admin-success">{message}</p>}

      {activeTab === "products" && (
        <>
          <section className="admin-panel">
            <div className="admin-section-heading">
              <div>
                <span className="admin-eyebrow">
                  {editingId ? "EDIT CATALOGUE ITEM" : "NEW CATALOGUE ITEM"}
                </span>
                <h2>{editingId ? "Update product" : "Add a product"}</h2>
              </div>

              {editingId && (
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={resetForm}
                >
                  Cancel edit
                </button>
              )}
            </div>

            <form className="admin-product-form" onSubmit={handleSubmit}>
              <label>
                Product name *
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Category *
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Shawl"
                  required
                />
              </label>

              <label>
                Sub category (dropdown menu ke liye)
                <input
                  name="subCategory"
                  value={form.subCategory}
                  onChange={handleChange}
                  list="sub-category-options"
                  placeholder="e.g. Embroidered - 2 Piece"
                />
                <datalist id="sub-category-options">
                  {subCategorySuggestions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </label>

              <div className="size-stock-editor">
                <p className="size-stock-title">
                  Sizes aur stock (har size ke kitne piece hain)
                </p>

                {form.stockRows.map((row, index) => (
                  <div
                    className="size-stock-row"
                    key={index}
                  >
                    <input
                      placeholder="Size (S, M, L...)"
                      value={row.size}
                      onChange={(event) =>
                        updateStockRow(
                          index,
                          "size",
                          event.target.value
                        )
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      placeholder="Stock"
                      value={row.stock}
                      onChange={(event) =>
                        updateStockRow(
                          index,
                          "stock",
                          event.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() => removeStockRow(index)}
                      aria-label="Remove size"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <div className="size-stock-actions">
                  <button
                    type="button"
                    onClick={addStockRow}
                  >
                    + Add size
                  </button>

                  <button
                    type="button"
                    onClick={addStandardSizes}
                  >
                    + Add S, M, L, XL
                  </button>
                </div>
              </div>

              <label>
                Description (detail page par dikhegi)
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Fabric, kaam, aur kya kya shamil hai..."
                />
              </label>

              <label>
                Extra photos (har line mein ek link)
                <textarea
                  name="images"
                  value={form.images}
                  onChange={handleChange}
                  rows="3"
                  placeholder={"https://...\nhttps://..."}
                />
              </label>

              <label>
                Price (Rs.) *
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Old price (Rs.)
                <input
                  name="oldPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.oldPrice}
                  onChange={handleChange}
                />
              </label>

              <label>
                Badge
                <select
                  name="badge"
                  value={form.badge}
                  onChange={handleChange}
                >
                  <option value="">No badge</option>
                  <option value="New">New</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="Sale">Sale</option>
                  <option value="Limited">Limited</option>
                </select>
              </label>

              <label>
                Image URL *
                <input
                  name="image"
                  type="url"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://..."
                  required
                />
              </label>

              <label>
                Initial / fallback text
                <input
                  name="initial"
                  value={form.initial}
                  onChange={handleChange}
                />
              </label>

              <label>
                Art class
                <input
                  name="artClass"
                  value={form.artClass}
                  onChange={handleChange}
                  placeholder="Optional CSS class"
                />
              </label>

              <label className="admin-stock-checkbox">
                <input
                  name="inStock"
                  type="checkbox"
                  checked={form.inStock}
                  onChange={handleChange}
                />
                Product is in stock
              </label>

              <div className="admin-form-actions">
                <button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Add product"}
                </button>
              </div>
            </form>
          </section>

          <section className="admin-panel">
            <div className="admin-section-heading admin-list-heading">
              <div>
                <span className="admin-eyebrow">YOUR INVENTORY</span>
                <h2>Products ({filteredProducts.length})</h2>
              </div>

              <input
                className="admin-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
              />
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="admin-product-cell">
                          <img src={product.image} alt="" />
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td>
                        {product.category}
                        {product.subCategory
                          ? ` · ${product.subCategory}`
                          : ""}
                        {product.stockBySize?.length > 0 && (
                          <>
                            <br />
                            <small>
                              Stock:{" "}
                              {product.stockBySize
                                .map(
                                  (entry) =>
                                    `${entry.size}:${entry.stock}`
                                )
                                .join("  ")}
                            </small>
                          </>
                        )}
                      </td>
                      <td>{formatPrice(product.price)}</td>
                      <td>
                        <span
                          className={`admin-stock ${
                            product.inStock ? "available" : "unavailable"
                          }`}
                        >
                          {product.inStock ? "In stock" : "Out of stock"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            onClick={() => startEdit(product)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleStock(product)}
                          >
                            {product.inStock ? "Mark out" : "Restock"}
                          </button>
                          <button
                            type="button"
                            className="admin-delete-btn"
                            onClick={() => deleteProduct(product)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="5" className="admin-empty">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {activeTab === "orders" && (
        <section className="admin-panel">
          <div className="admin-section-heading admin-list-heading">
            <div>
              <span className="admin-eyebrow">CUSTOMER PURCHASES</span>
              <h2>Orders ({filteredOrders.length})</h2>
            </div>

            <div className="admin-order-filters">
              <input
                className="admin-search"
                value={orderSearch}
                onChange={(event) => setOrderSearch(event.target.value)}
                placeholder="Search customer or order ID..."
                aria-label="Search orders"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by order status"
              >
                <option value="all">All statuses</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="admin-secondary-btn"
                onClick={async () => {
                  setError("");
                  setMessage("");
                  try {
                    await loadOrders();
                    setMessage("Orders refreshed.");
                  } catch (err) {
                    setError(err.message);
                  }
                }}
              >
                Refresh
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <p className="admin-empty">No orders found.</p>
          ) : (
            <div className="admin-orders-list">
              {filteredOrders.map((order) => {
                const customer =
                  order.shippingAddress?.fullName ||
                  order.userId?.name ||
                  "Customer";

                return (
                  <article className="admin-order-card" key={order._id}>
                    <div className="admin-order-top">
                      <div>
                        <span className="admin-eyebrow">ORDER ID</span>
                        <h3>{order._id}</h3>
                        <p>{formatDate(order.createdAt)}</p>
                      </div>

                      <span
                        className={`admin-order-status status-${order.status}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="admin-order-details">
                      <div>
                        <span>Customer</span>
                        <strong>{customer}</strong>
                        <p>{order.userId?.email || "Email unavailable"}</p>
                      </div>

                      <div>
                        <span>Phone</span>
                        <strong>
                          {order.shippingAddress?.phone || "—"}
                        </strong>
                      </div>

                      <div>
                        <span>Delivery address</span>
                        <strong>
                          {[
                            order.shippingAddress?.address,
                            order.shippingAddress?.city,
                            order.shippingAddress?.postalCode,
                          ]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </strong>
                      </div>

                      <div>
                        <span>Payment method</span>
                        <strong>
                          {order.paymentMethod === "CARD"
                            ? "Card"
                            : "Cash on delivery"}
                        </strong>
                      </div>
                    </div>

                    <div className="admin-order-items">
                      <h4>Items ordered</h4>
                      {order.items?.map((item, index) => (
                        <div
                          className="admin-order-item"
                          key={`${item.productId || item.name}-${index}`}
                        >
                          {item.image ? (
                            <img src={item.image} alt="" />
                          ) : (
                            <div className="admin-order-item-placeholder">
                              FS
                            </div>
                          )}

                          <div>
                            <strong>{item.name}</strong>
                            <p>
                              Qty: {item.quantity} × {formatPrice(item.price)}
                              {item.size ? ` · Size: ${item.size}` : ""}
                            </p>
                          </div>

                          <strong>
                            {formatPrice(
                              Number(item.price) * Number(item.quantity)
                            )}
                          </strong>
                        </div>
                      ))}
                    </div>

                    <div className="admin-order-bottom">
                      <div className="admin-order-totals">
                        <span>Subtotal: {formatPrice(order.subtotal)}</span>
                        <span>Shipping: {formatPrice(order.shipping)}</span>
                        <strong>Total: {formatPrice(order.total)}</strong>
                      </div>

                      <label className="admin-status-control">
                        Update status
                        <select
                          value={order.status}
                          disabled={updatingOrderId === order._id}
                          onChange={(event) =>
                            updateOrderStatus(order, event.target.value)
                          }
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() +
                                status.slice(1)}
                            </option>
                          ))}
                        </select>
                        {updatingOrderId === order._id && (
                          <small>Updating...</small>
                        )}
                      </label>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default AdminDashboard;