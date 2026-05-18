import { startTransition, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { ApiError, toFieldErrors } from "../lib/api-client";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  preferredLanguage: "en",
};

function validateRegisterForm(form) {
  const errors = {};

  if (form.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!form.email.includes("@")) {
    errors.email = "Enter a valid email address.";
  }

  if (form.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (!/[A-Z]/.test(form.password)) {
    errors.password = "Password must include at least one uppercase letter.";
  } else if (!/[a-z]/.test(form.password)) {
    errors.password = "Password must include at least one lowercase letter.";
  } else if (!/[0-9]/.test(form.password)) {
    errors.password = "Password must include at least one number.";
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Passwords must match.";
  }

  return errors;
}

function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const clientErrors = validateRegisterForm(form);
    setFieldErrors(clientErrors);
    setErrorMessage("");

    if (Object.keys(clientErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        preferredLanguage: form.preferredLanguage,
      });
      startTransition(() => {
        navigate("/dashboard");
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors((current) => ({ ...current, ...toFieldErrors(error.details) }));
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to create your account right now. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page auth-page">
      <div className="shell-container auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">Farmer onboarding</p>
          <h2>Create your account and unlock the new crop recommendation workspace.</h2>
          <p>
            Registration now enforces the same password rules as the backend, stores the JWT session, and lands you
            directly inside the authenticated flow.
          </p>
          <div className="surface-card auth-highlight">
            <p className="card-kicker">Password rules</p>
            <ul className="compact-list">
              <li>At least 8 characters</li>
              <li>One uppercase and one lowercase letter</li>
              <li>At least one number</li>
            </ul>
          </div>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Basava"
              autoComplete="name"
              required
            />
            {fieldErrors.name ? <small className="field-hint field-hint-error">{fieldErrors.name}</small> : null}
          </label>

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
              minLength={8}
              autoComplete="new-password"
              required
            />
            {fieldErrors.password ? <small className="field-hint field-hint-error">{fieldErrors.password}</small> : null}
          </label>

          <label className="field">
            <span>Confirm password</span>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              placeholder="Repeat password"
              autoComplete="new-password"
              required
            />
            {fieldErrors.confirmPassword ? (
              <small className="field-hint field-hint-error">{fieldErrors.confirmPassword}</small>
            ) : null}
          </label>

          <label className="field">
            <span>Preferred language</span>
            <select
              value={form.preferredLanguage}
              onChange={(event) => setForm((current) => ({ ...current, preferredLanguage: event.target.value }))}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="kn">Kannada</option>
            </select>
            <small className="field-hint">Used for your account preference in protected APIs.</small>
          </label>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <button type="submit" className="primary-button full-width" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>

          <p className="auth-footnote">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default RegisterPage;
