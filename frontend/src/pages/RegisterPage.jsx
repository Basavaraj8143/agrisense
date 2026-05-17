import { startTransition, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "../lib/api-client";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  password: "",
  preferredLanguage: "en",
};

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      await register(form);
      startTransition(() => {
        navigate("/dashboard");
      });
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "Unable to create your account right now. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page auth-page">
      <div className="shell-container auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">Farmer onboarding</p>
          <h2>Create an account and prepare the app for protected workflows.</h2>
          <p>
            Day 10 can now focus on UX refinement and feature-specific flows instead of first building auth plumbing.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Basava"
              required
            />
          </label>

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
              minLength={8}
              required
            />
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
