import { useState } from "react";
import { useAuth } from "../AuthContext";
import { API_BASE } from "../apiConfig";

const API_URL = API_BASE;

function AccountDrawer({ isOpen, onClose, onOpenOrders,}) {
  // Email ke reset link se aane par URL mein ?reset=TOKEN hota hai
  const [resetToken] = useState(
    () => new URLSearchParams(window.location.search).get("reset") || ""
  );

  // modes: "login" | "signup" | "forgot" | "reset"
  const [mode, setMode] = useState(resetToken ? "reset" : "login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    user,
    loading,
    login,
    register,
    logout,
  } = useAuth();

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const switchMode = () => {
    resetMessages();

    setName("");
    setEmail("");
    setPassword("");

    setMode(
      mode === "login"
        ? "signup"
        : "login"
    );
  };

  const backToLogin = () => {
    resetMessages();

    setPassword("");
    setConfirmPassword("");

    // Reset link wala ?reset=... URL se hata do
    if (resetToken) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    setMode("login");
  };

  const handleForgotSubmit = async (event) => {
    event.preventDefault();

    resetMessages();
    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to send reset link."
        );
      }

      setSuccess(data.message);
      setEmail("");
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();

    resetMessages();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: resetToken,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to reset password."
        );
      }

      window.history.replaceState(null, "", window.location.pathname);

      setPassword("");
      setConfirmPassword("");
      setMode("login");
      setSuccess(
        "Your password has been reset. Please sign in with your new password."
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    resetMessages();
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login(email, password);

        setSuccess(
          "Login successful."
        );
      } else {
        await register(
          name,
          email,
          password
        );

        setSuccess(
          "Account created successfully."
        );
      }

      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();

    resetMessages();

    setMode("login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="account-overlay"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`account-drawer ${
          isOpen ? "account-open" : ""
        }`}
      >
        <div className="account-header">
          <div>
            <p className="account-label">
              MY ACCOUNT
            </p>

            <h2>
              {mode === "forgot" || mode === "reset"
                ? "Reset Password"
                : user
                ? `Hello, ${user.name}`
                : mode === "login"
                ? "Welcome Back"
                : "Create Account"}
            </h2>
          </div>

          <button
            className="account-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="account-content">
          {mode === "reset" ? (
            <>
              <p className="account-intro">
                Choose a new password for your account.
              </p>

              {error && (
                <p className="account-error">
                  {error}
                </p>
              )}

              {success && (
                <p className="account-success">
                  {success}
                </p>
              )}

              <form
                className="account-form"
                onSubmit={handleResetSubmit}
              >
                <label>
                  NEW PASSWORD

                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    minLength={6}
                    required
                  />
                </label>

                <label>
                  CONFIRM PASSWORD

                  <input
                    type="password"
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    minLength={6}
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="account-submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "PLEASE WAIT..."
                    : "SET NEW PASSWORD →"}
                </button>
              </form>

              <div className="account-divider">
                <span>OR</span>
              </div>

              <div className="account-switch">
                <p>Remember your password?</p>

                <button onClick={backToLogin}>
                  SIGN IN
                </button>
              </div>
            </>
          ) : mode === "forgot" ? (
            <>
              <p className="account-intro">
                Enter the email address of your account and we will
                send you a link to reset your password.
              </p>

              {error && (
                <p className="account-error">
                  {error}
                </p>
              )}

              {success && (
                <p className="account-success">
                  {success}
                </p>
              )}

              <form
                className="account-form"
                onSubmit={handleForgotSubmit}
              >
                <label>
                  EMAIL ADDRESS

                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="account-submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "PLEASE WAIT..."
                    : "SEND RESET LINK →"}
                </button>
              </form>

              <div className="account-divider">
                <span>OR</span>
              </div>

              <div className="account-switch">
                <p>Remember your password?</p>

                <button onClick={backToLogin}>
                  SIGN IN
                </button>
              </div>
            </>
          ) : loading ? (
            <p className="account-intro">
              Loading your account...
            </p>
          ) : user ? (
            <>
              <p className="account-intro">
                Welcome back, {user.name}. Your
                account is ready.
              </p>

              <div className="account-user-info">
                <p>
                  <strong>NAME</strong>
                  <span>{user.name}</span>
                </p>

                <p>
                  <strong>EMAIL</strong>
                  <span>{user.email}</span>
                </p>

                <p>
                  <strong>ACCOUNT</strong>
                  <span>
                    {user.role === "admin"
                      ? "Administrator"
                      : "Customer"}
                  </span>
                </p>
              </div>

            <button
               type="button"
              className="account-submit"
               onClick={onOpenOrders}
            >
               MY ORDERS →
            </button>

              <button
                type="button"
                className="account-submit"
                onClick={handleLogout}
              >
                LOG OUT →
              </button>
            </>
          ) : (
            <>
              <p className="account-intro">
                {mode === "login"
                  ? "Sign in to access your account, orders and saved items."
                  : "Create an account to keep your favourite pieces and shopping details in one place."}
              </p>

              {error && (
                <p className="account-error">
                  {error}
                </p>
              )}

              {success && (
                <p className="account-success">
                  {success}
                </p>
              )}

              <form
                className="account-form"
                onSubmit={handleSubmit}
              >
                {mode === "signup" && (
                  <label>
                    FULL NAME

                    <input
                      type="text"
                      placeholder="Your full name"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      required
                    />
                  </label>
                )}

                <label>
                  EMAIL ADDRESS

                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                  />
                </label>

                <label>
                  PASSWORD

                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    minLength={6}
                    required
                  />
                </label>

                {mode === "login" && (
                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() => {
                      resetMessages();
                      setPassword("");
                      setMode("forgot");
                    }}
                  >
                    Forgot password?
                  </button>
                )}

                <button
                  type="submit"
                  className="account-submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "PLEASE WAIT..."
                    : mode === "login"
                    ? "SIGN IN →"
                    : "CREATE ACCOUNT →"}
                </button>
              </form>

              <div className="account-divider">
                <span>OR</span>
              </div>

              <div className="account-switch">
                <p>
                  {mode === "login"
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </p>

                <button
                  onClick={switchMode}
                >
                  {mode === "login"
                    ? "CREATE ACCOUNT"
                    : "SIGN IN"}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="account-footer">
          <span>SECURE SHOPPING</span>
          <span>•</span>
          <span>PAKISTAN WIDE DELIVERY</span>
        </div>
      </aside>
    </>
  );
}

export default AccountDrawer;