import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { API_BASE } from "./apiConfig";

const AuthContext = createContext(null);

const API_URL = API_BASE;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("fabricStoreToken");

    if (!token) {
      setLoading(false);
      return;
    }

    async function loadUser() {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          localStorage.removeItem("fabricStoreToken");
          setUser(null);
          return;
        }

        const data = await response.json();

        setUser(data.user);
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("fabricStoreToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function register(name, email, password) {
    const response = await fetch(
      `${API_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Registration failed"
      );
    }

    localStorage.setItem(
      "fabricStoreToken",
      data.token
    );

    setUser(data.user);

    return data;
  }

  async function login(email, password) {
    const response = await fetch(
      `${API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Login failed"
      );
    }

    localStorage.setItem(
      "fabricStoreToken",
      data.token
    );

    setUser(data.user);

    return data;
  }

  async function logout() {
    const token =
      localStorage.getItem("fabricStoreToken");

    try {
      if (token) {
        await fetch(
          `${API_URL}/api/auth/logout`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("fabricStoreToken");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}