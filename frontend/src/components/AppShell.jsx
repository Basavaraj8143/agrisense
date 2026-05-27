import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/crop", label: "Crop Recommendation" },
  { to: "/pest", label: "Pest Detection" },
  { to: "/dashboard", label: "Dashboard" },
];

function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="legacy-app">
      <div className="offline-banner">Works partially offline in low connectivity regions</div>

      <header className="legacy-header">
        <div className="legacy-container legacy-header-inner">
          <div className="legacy-header-top">
            <NavLink to="/" className="legacy-brand" aria-label="AgriSense home">
              <div className="legacy-brand-mark">AS</div>
              <div>
                <h1 className="legacy-brand-name">AgriSense</h1>
                <p className="legacy-brand-tagline">AI Crop Recommendation System</p>
              </div>
            </NavLink>

            <div className="legacy-header-actions">
              <select
                className="legacy-language-select"
                aria-label="Preferred language"
                value={user?.preferredLanguage || "en"}
                onChange={() => {}}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="kn">Kannada</option>
              </select>

              {isAuthenticated ? (
                <>
                  <NavLink to="/profile" className="legacy-outline-button">
                    Profile
                  </NavLink>
                  <button type="button" className="legacy-outline-button" onClick={logout}>
                    Sign Out
                  </button>
                </>
              ) : (
                <NavLink to="/login" className="legacy-solid-button legacy-header-button">
                  Sign In
                </NavLink>
              )}

              <button
                type="button"
                className="legacy-menu-button"
                onClick={() => setMenuOpen((current) => !current)}
                aria-expanded={menuOpen}
                aria-label="Toggle navigation"
              >
                Menu
              </button>
            </div>
          </div>

          <nav className="legacy-desktop-nav">
            <ul className="legacy-nav-list">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `legacy-nav-link ${isActive ? "is-active" : ""}`}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={`legacy-mobile-nav ${menuOpen ? "is-open" : ""}`}>
            <ul className="legacy-mobile-nav-list">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `legacy-mobile-nav-link ${isActive ? "is-active" : ""}`}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              {!isAuthenticated ? (
                <li>
                  <NavLink to="/register" className="legacy-mobile-nav-link">
                    Create Account
                  </NavLink>
                </li>
              ) : (
                <li>
                  <NavLink to="/profile" className="legacy-mobile-nav-link">
                    Profile
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main className="legacy-main">
        <Outlet />
      </main>

      <footer className="legacy-footer">
        <div className="legacy-container legacy-footer-grid">
          <div>
            <div className="legacy-footer-brand">
              <div className="legacy-footer-mark">AS</div>
              <span>AgriSense</span>
            </div>
            <p className="legacy-footer-copy">
              Empowering farmers with AI-powered agricultural solutions for sustainable and profitable farming.
            </p>
            <div className="legacy-footer-note">© 2025 AgriSense Team | Built for Smart India Hackathon</div>
          </div>

          <div>
            <h4 className="legacy-footer-heading">Quick Links</h4>
            <ul className="legacy-footer-list">
              <li>
                <NavLink to="/">Home</NavLink>
              </li>
              <li>
                <NavLink to="/crop">Crop Recommendation</NavLink>
              </li>
              <li>
                <NavLink to="/pest">Pest Detection</NavLink>
              </li>
              <li>
                <NavLink to="/dashboard">Dashboard</NavLink>
              </li>
              {isAuthenticated ? (
                <li>
                  <NavLink to="/profile">Profile</NavLink>
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            <h4 className="legacy-footer-heading">Features</h4>
            <ul className="legacy-footer-list">
              <li>AI Crop Recommendations</li>
              <li>Pest Detection</li>
              <li>Yield Predictions</li>
              <li>Market Price Analysis</li>
              <li>Multilingual Support</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppShell;
