import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function DashboardPage() {
  const { isAuthenticated, status, token, user } = useAuth();

  return (
    <section className="page">
      <div className="shell-container route-hero">
        <div>
          <p className="eyebrow">Dashboard route</p>
          <h2>{isAuthenticated ? `Welcome back, ${user?.name || "farmer"}.` : "Sign in to unlock your dashboard."}</h2>
          <p>
            This page is intentionally lightweight for Day 9, but it already understands auth state and token
            persistence, which makes it a stable landing page for upcoming history and saved-query modules.
          </p>
        </div>

        <div className="surface-card">
          <p className="card-kicker">Session state</p>
          <dl className="session-list">
            <div>
              <dt>Status</dt>
              <dd>{status}</dd>
            </div>
            <div>
              <dt>User</dt>
              <dd>{user?.email || "Not signed in"}</dd>
            </div>
            <div>
              <dt>Token</dt>
              <dd>{token ? `${token.slice(0, 18)}...` : "None stored"}</dd>
            </div>
          </dl>

          {!isAuthenticated && (
            <Link to="/login" className="primary-button inline-button">
              Sign in to continue
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
