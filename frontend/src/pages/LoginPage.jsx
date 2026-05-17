import { startTransition, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "../lib/api-client";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  email: "",
  password: "",
};

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      await login(form);
      startTransition(() => {
        navigate("/dashboard");
      });
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "Unable to sign in right now. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page auth-page">
      <div className="shell-container auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">Authentication foundation</p>
          <h2>Sign in through the new React frontend.</h2>
          <p>
            The form is already pointed at the Node auth endpoints, and successful sessions persist the JWT token for
            protected routes.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="farmer@example.com"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="StrongPass@123"
              required
            />
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
