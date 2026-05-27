import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { cropApi, pestApi } from "../lib/api-client";

const languageLabels = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
};

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "AS";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatProvider(provider) {
  if (!provider) {
    return "Unknown";
  }

  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

function ProfilePage() {
  const { token, user, logout } = useAuth();
  const [cropItems, setCropItems] = useState([]);
  const [pestItems, setPestItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isCancelled = false;

    async function loadSummary() {
      setStatus("loading");

      try {
        const [nextCropItems, nextPestItems] = await Promise.all([cropApi.history(token, 6), pestApi.history(token, 6)]);

        if (!isCancelled) {
          setCropItems(nextCropItems);
          setPestItems(nextPestItems);
          setStatus("ready");
        }
      } catch (error) {
        if (!isCancelled) {
          setStatus("error");
        }
      }
    }

    loadSummary();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  const stats = useMemo(
    () => [
      { label: "Recent Crop Runs", value: cropItems.length, accent: "accent-green" },
      { label: "Recent Pest Checks", value: pestItems.length, accent: "accent-blue" },
      { label: "Preferred Language", value: languageLabels[user?.preferredLanguage] || "English", accent: "accent-purple" },
      { label: "Account Type", value: formatProvider(user?.authProvider), accent: "accent-orange" },
    ],
    [cropItems.length, pestItems.length, user?.preferredLanguage, user?.authProvider]
  );

  return (
    <section className="legacy-profile-page">
      <div className="legacy-dashboard-hero legacy-profile-hero">
        <div className="legacy-container legacy-profile-hero-inner">
          <div className="legacy-profile-avatar">{getInitials(user?.name)}</div>
          <div>
            <h2 className="legacy-dashboard-title">Your Profile</h2>
            <p className="legacy-dashboard-subtitle">
              Review your AgriSense account details, workspace activity, and quick actions in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="legacy-section">
        <div className="legacy-container">
          <div className="legacy-profile-grid">
            <article className="legacy-card">
              <h3 className="legacy-card-title">Account Details</h3>
              <div className="legacy-profile-details">
                <div className="legacy-profile-row">
                  <span>Name</span>
                  <strong>{user?.name || "Unknown user"}</strong>
                </div>
                <div className="legacy-profile-row">
                  <span>Email</span>
                  <strong>{user?.email || "Not available"}</strong>
                </div>
                <div className="legacy-profile-row">
                  <span>Preferred Language</span>
                  <strong>{languageLabels[user?.preferredLanguage] || "English"}</strong>
                </div>
                <div className="legacy-profile-row">
                  <span>Provider</span>
                  <strong>{formatProvider(user?.authProvider)}</strong>
                </div>
                <div className="legacy-profile-row">
                  <span>Role</span>
                  <strong>{user?.role || "farmer"}</strong>
                </div>
              </div>

              <div className="legacy-assist-panel tone-neutral">
                <span className="legacy-assist-badge">Coming Soon</span>
                <p>
                  Profile editing, password management, and language updates are not wired to backend APIs yet. This page is
                  currently a read-only account hub.
                </p>
              </div>
            </article>

            <article className="legacy-card">
              <h3 className="legacy-card-title">Quick Actions</h3>
              <div className="legacy-profile-actions">
                <Link to="/crop" className="legacy-solid-button legacy-full-width">
                  New Crop Recommendation
                </Link>
                <Link to="/pest" className="legacy-outline-button legacy-full-width">
                  New Pest Detection
                </Link>
                <Link to="/dashboard" className="legacy-outline-button legacy-full-width">
                  Open Dashboard
                </Link>
                <button type="button" className="legacy-text-button legacy-full-width legacy-signout-text" onClick={logout}>
                  Sign out of this account
                </button>
              </div>

              <div className="legacy-profile-status-card">
                <h4 className="legacy-panel-title">Workspace Status</h4>
                <div className="legacy-status-stack">
                  <div className="legacy-status-row">
                    <span>Session</span>
                    <strong>Active</strong>
                  </div>
                  <div className="legacy-status-row">
                    <span>History Sync</span>
                    <strong>{status === "ready" ? "Healthy" : status === "loading" ? "Loading" : "Attention"}</strong>
                  </div>
                  <div className="legacy-status-row">
                    <span>Profile Editing</span>
                    <strong>Pending API</strong>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="legacy-stats-grid">
            {stats.map((item) => (
              <article key={item.label} className={`legacy-stat-card ${item.accent}`}>
                <div className="legacy-stat-value legacy-stat-value-small">{item.value}</div>
                <div className="legacy-stat-label">{item.label}</div>
              </article>
            ))}
          </div>

          <div className="legacy-profile-grid legacy-profile-lower-grid">
            <article className="legacy-card">
              <h3 className="legacy-card-title">Recent Crop Activity</h3>
              {status === "loading" ? <p className="legacy-card-copy">Loading crop activity...</p> : null}
              {status === "error" ? <p className="legacy-card-copy">Unable to load crop activity right now.</p> : null}
              {status === "ready" && cropItems.length === 0 ? (
                <p className="legacy-card-copy">No crop recommendations saved yet.</p>
              ) : null}
              {status === "ready" && cropItems.length > 0 ? (
                <div className="legacy-mini-list">
                  {cropItems.map((item) => (
                    <div key={item.id} className="legacy-mini-item">
                      <strong>{item.primaryCrop?.name || "Unknown crop"}</strong>
                      <span>{item.location?.district || "Unknown district"}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>

            <article className="legacy-card">
              <h3 className="legacy-card-title">Recent Pest Activity</h3>
              {status === "loading" ? <p className="legacy-card-copy">Loading pest activity...</p> : null}
              {status === "error" ? <p className="legacy-card-copy">Unable to load pest activity right now.</p> : null}
              {status === "ready" && pestItems.length === 0 ? (
                <p className="legacy-card-copy">No pest detections saved yet.</p>
              ) : null}
              {status === "ready" && pestItems.length > 0 ? (
                <div className="legacy-mini-list">
                  {pestItems.map((item) => (
                    <div key={item.id} className="legacy-mini-item">
                      <strong>{item.result?.scientificName || "Unknown pest"}</strong>
                      <span>{item.result?.confidencePercent ?? 0}% confidence</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
