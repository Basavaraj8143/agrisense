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
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="site-header">
        <div className="shell-container">
          <div className="brand-lockup">
            <div className="brand-mark">A</div>
            <div>
              <p className="eyebrow">AgriSense Rebuild</p>
              <h1 className="brand-title">Smart farming, now in React.</h1>
            </div>
          </div>

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
              {isAuthenticated ? user?.name || "Signed in" : "Guest mode"}
            </div>

            {isAuthenticated ? (
              <button type="button" className="ghost-button" onClick={logout}>
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
          <div>
            <p className="eyebrow">Day 9 foundation</p>
            <h2 className="footer-title">React shell, routing, and auth-ready plumbing.</h2>
          </div>
          <div className="footer-copy">
            <p>
              Legacy HTML pages remain in this folder as reference while the new frontend routes move feature-by-feature
              onto the Node + ML architecture.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppShell;
