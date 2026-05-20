import { startTransition, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { ApiError, toFieldErrors } from "../lib/api-client";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  email: "",
  password: "",
};

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from || "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setFieldErrors({});

    try {
      await login(form);
      startTransition(() => {
        navigate(redirectTo, { replace: true });
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(toFieldErrors(error.details));
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to sign in right now. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="legacy-section">
      <div className="legacy-container">
        <div className="legacy-auth-layout">
          <div className="legacy-gradient-panel">
            <h2 className="legacy-panel-title">Welcome back to AgriSense</h2>
            <p className="legacy-gradient-copy">
              Sign in to continue to crop recommendation, pest detection, and your saved farming dashboard.
            </p>
            <ul className="legacy-list legacy-list-light">
              <li>Protected access to crop and pest workflows</li>
              <li>Saved history tied to your account</li>
              <li>Automatic redirect back to your intended page</li>
            </ul>
          </div>

          <form className="legacy-card legacy-form-card" onSubmit={handleSubmit}>
            <h3 className="legacy-card-title">Sign In</h3>
            <p className="legacy-card-copy">Use the same account you created in the register flow.</p>

            <label className="legacy-field">
              <span>Email</span>
              <input
                type="email"
                className="legacy-input"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="farmer@example.com"
                autoComplete="email"
                required
              />
              {fieldErrors.email ? <small className="legacy-field-error">{fieldErrors.email}</small> : null}
            </label>

            <label className="legacy-field">
              <span>Password</span>
              <input
                type="password"
                className="legacy-input"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="StrongPass@123"
                autoComplete="current-password"
                required
              />
              {fieldErrors.password ? <small className="legacy-field-error">{fieldErrors.password}</small> : null}
            </label>

            {errorMessage ? <div className="legacy-error-box">{errorMessage}</div> : null}

            <button type="submit" className="legacy-solid-button legacy-full-width" disabled={submitting}>
              {submitting ? "Signing In..." : "Sign In"}
            </button>

            <p className="legacy-footnote">
              Need an account? <Link to="/register">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
