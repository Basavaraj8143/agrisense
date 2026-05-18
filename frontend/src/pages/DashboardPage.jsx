import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function DashboardPage() {
  const { status, token, user } = useAuth();

  return (
    <section className="page">
      <div className="shell-container route-hero">
        <div>
          <p className="eyebrow">Dashboard preview</p>
          <h2>{`Welcome back, ${user?.name || "farmer"}.`}</h2>
          <p>
            Day 10 now lands you here after successful auth. Day 11 can use this page for recent crop and pest query
            history without revisiting the session plumbing.
          </p>
        </div>

        <div className="surface-card">
          <p className="card-kicker">Authenticated session</p>
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

          <div className="hero-actions">
            <Link to="/crop" className="primary-button inline-button">
              Run crop recommendation
            </Link>
            <Link to="/pest" className="secondary-button inline-button">
              Open pest analysis
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
