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
  const { isAuthenticated, login, user } = useAuth();
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
    <section className="page auth-page">
      <div className="shell-container auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">Secure sign in</p>
          <h2>Return to your farm workspace and protected recommendation tools.</h2>
          <p>
            This login now talks directly to the Node auth API, restores the JWT session, and opens crop and pest flows
            without leaving the React app.
          </p>
          <div className="surface-card auth-highlight">
            <p className="card-kicker">Current session target</p>
            <strong>{location.state?.from ? `Continue to ${location.state.from}` : "Open your dashboard"}</strong>
            <p>{user?.email ? `Signed in as ${user.email}` : "Use the same credentials created in the Register flow."}</p>
          </div>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="farmer@example.com"
              autoComplete="email"
              required
            />
            {fieldErrors.email ? <small className="field-hint field-hint-error">{fieldErrors.email}</small> : null}
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="StrongPass@123"
              autoComplete="current-password"
              required
            />
            {fieldErrors.password ? <small className="field-hint field-hint-error">{fieldErrors.password}</small> : null}
          </label>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <button type="submit" className="primary-button full-width" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="auth-footnote">
            Need an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;
