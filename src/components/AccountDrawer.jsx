import { useState } from "react";

function AccountDrawer({ isOpen, onClose }) {
  const [mode, setMode] = useState("login");

  const handleSubmit = (event) => {
    event.preventDefault();

    alert(
      mode === "login"
        ? "Login is currently available as a frontend demo."
        : "Account signup is currently available as a frontend demo."
    );
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
              {mode === "login"
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

          <p className="account-intro">
            {mode === "login"
              ? "Sign in to access your account, orders and saved items."
              : "Create an account to keep your favourite pieces and shopping details in one place."}
          </p>


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
                  required
                />
              </label>
            )}


            <label>
              EMAIL ADDRESS

              <input
                type="email"
                placeholder="your@email.com"
                required
              />
            </label>


            <label>
              PASSWORD

              <input
                type="password"
                placeholder="Enter your password"
                required
              />
            </label>


            {mode === "login" && (
              <button
                type="button"
                className="forgot-password"
              >
                Forgot password?
              </button>
            )}


            <button
              type="submit"
              className="account-submit"
            >
              {mode === "login"
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
              onClick={() =>
                setMode(
                  mode === "login"
                    ? "signup"
                    : "login"
                )
              }
            >
              {mode === "login"
                ? "CREATE ACCOUNT"
                : "SIGN IN"}
            </button>

          </div>

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