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
    <section className="legacy-section">
      <div className="legacy-container">
        <div className="legacy-auth-layout">
          <div className="legacy-gradient-panel">
            <h2 className="legacy-panel-title">Create your farming account</h2>
            <p className="legacy-gradient-copy">
              Register once to save crop recommendations, pest detections, and dashboard history inside the new React
              app.
            </p>
            <ul className="legacy-list legacy-list-light">
              <li>JWT session restored automatically after sign in</li>
              <li>Preferred language stored with your user profile</li>
              <li>Direct access to protected crop and pest routes</li>
            </ul>
          </div>

          <form className="legacy-card legacy-form-card" onSubmit={handleSubmit}>
            <h3 className="legacy-card-title">Create Account</h3>
            <p className="legacy-card-copy">These fields follow the backend validation rules exactly.</p>

            <label className="legacy-field">
              <span>Name</span>
              <input
                type="text"
                className="legacy-input"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Basava"
                autoComplete="name"
                required
              />
              {fieldErrors.name ? <small className="legacy-field-error">{fieldErrors.name}</small> : null}
            </label>

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
                autoComplete="new-password"
                required
              />
              {fieldErrors.password ? <small className="legacy-field-error">{fieldErrors.password}</small> : null}
            </label>

            <label className="legacy-field">
              <span>Confirm Password</span>
              <input
                type="password"
                className="legacy-input"
                value={form.confirmPassword}
                onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                placeholder="Repeat password"
                autoComplete="new-password"
                required
              />
              {fieldErrors.confirmPassword ? <small className="legacy-field-error">{fieldErrors.confirmPassword}</small> : null}
            </label>

            <label className="legacy-field">
              <span>Preferred Language</span>
              <select
                className="legacy-input"
                value={form.preferredLanguage}
                onChange={(event) => setForm((current) => ({ ...current, preferredLanguage: event.target.value }))}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="kn">Kannada</option>
              </select>
            </label>

            {errorMessage ? <div className="legacy-error-box">{errorMessage}</div> : null}

            <button type="submit" className="legacy-solid-button legacy-full-width" disabled={submitting}>
              {submitting ? "Creating Account..." : "Create Account"}
            </button>

            <p className="legacy-footnote">
              Already registered? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;
