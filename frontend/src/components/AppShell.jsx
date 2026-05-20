import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/crop", label: "Crop" },
  { to: "/pest", label: "Pest" },
  { to: "/dashboard", label: "Dashboard" },
];

function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout, status } = useAuth();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="topbar">Localized crop intelligence, pest diagnosis, and saved field history in one workspace.</div>

        <div className="shell-container header-row">
          <NavLink to="/" className="brand-lockup" aria-label="AgriSense home">
            <div className="brand-mark">AS</div>
            <div>
              <p className="eyebrow">Agri intelligence platform</p>
              <p className="brand-title">AgriSense</p>
            </div>
          </NavLink>

          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            Menu
          </button>

          <nav className={`site-nav ${menuOpen ? "is-open" : ""}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <div className="status-chip">
              <span className={`status-dot status-${status}`} />
              {isAuthenticated ? user?.name || "Workspace active" : "Guest mode"}
            </div>

            {isAuthenticated ? (
              <button type="button" className="ghost-button compact-button" onClick={logout}>
                Sign out
              </button>
            ) : (
              <NavLink to="/login" className="primary-button compact-button">
                Sign in
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="shell-container footer-grid">
          <div className="footer-brand">
            <p className="eyebrow">Current product state</p>
            <h2 className="footer-title">Field recommendations and pest workflows now share one consistent product UI.</h2>
            <p className="footer-copy">
              The frontend now follows a cleaner agri-tech system with clearer workflow panels, stronger trust cues,
              and more operational dashboard surfaces.
            </p>
          </div>

          <div className="footer-column">
            <p className="card-kicker">Modules</p>
            <ul className="bullet-list">
              <li>Protected auth and session restore</li>
              <li>Crop recommendation workspace</li>
              <li>Pest diagnosis and recent history</li>
            </ul>
          </div>

          <div className="footer-column">
            <p className="card-kicker">Delivery phase</p>
            <ul className="bullet-list">
              <li>Frontend MVP workflows complete</li>
              <li>Neon-backed persistence enabled</li>
              <li>Ready for hardening and end-to-end testing</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppShell;
