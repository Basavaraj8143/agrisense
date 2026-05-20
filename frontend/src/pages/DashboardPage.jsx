import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { cropApi, pestApi } from "../lib/api-client";

function formatDate(value) {
  if (!value) {
    return "Unknown time";
  }

  return new Date(value).toLocaleDateString();
}

function DashboardPage() {
  const { token, user } = useAuth();
  const [cropItems, setCropItems] = useState([]);
  const [pestItems, setPestItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isCancelled = false;

    async function loadDashboard() {
      setStatus("loading");

      try {
        const [nextCropItems, nextPestItems] = await Promise.all([cropApi.history(token, 4), pestApi.history(token, 4)]);

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

    loadDashboard();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  return (
    <section className="legacy-dashboard-page">
      <div className="legacy-dashboard-hero">
        <div className="legacy-container legacy-dashboard-hero-inner">
          <h2 className="legacy-dashboard-title">Your Farming Dashboard</h2>
          <p className="legacy-dashboard-subtitle">
            Track your recent crop recommendations, pest detections, and farming activity in one place, {user?.name || "farmer"}.
          </p>
        </div>
      </div>

      <div className="legacy-section">
        <div className="legacy-container">
          <div className="legacy-dashboard-grid">
            <article className="legacy-card">
              <h3 className="legacy-card-title">Recent Crop Recommendations</h3>
              {status === "loading" ? <p className="legacy-card-copy">Loading crop history...</p> : null}
              {status === "error" ? <p className="legacy-card-copy">Unable to load crop history right now.</p> : null}
              {status === "ready" && cropItems.length === 0 ? <p className="legacy-card-copy">No crop recommendations saved yet.</p> : null}
              {status === "ready" && cropItems.length > 0 ? (
                <div className="legacy-mini-list">
                  {cropItems.map((item) => (
                    <div key={item.id} className="legacy-mini-item">
                      <strong>{item.primaryCrop?.name || "Unknown crop"}</strong>
                      <span>{Math.round((item.primaryCrop?.score || 0) * 100)}% match</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>

            <article className="legacy-card">
              <h3 className="legacy-card-title">Recent Pest Analyses</h3>
              {status === "loading" ? <p className="legacy-card-copy">Loading pest history...</p> : null}
              {status === "error" ? <p className="legacy-card-copy">Unable to load pest history right now.</p> : null}
              {status === "ready" && pestItems.length === 0 ? <p className="legacy-card-copy">No pest analyses saved yet.</p> : null}
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

            <article className="legacy-card">
              <h3 className="legacy-card-title">Workspace Status</h3>
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
                  <span>Preferred Language</span>
                  <strong>{user?.preferredLanguage?.toUpperCase?.() || "EN"}</strong>
                </div>
              </div>
            </article>
          </div>

          <div className="legacy-stats-grid">
            <article className="legacy-stat-card accent-green">
              <div className="legacy-stat-value">{cropItems.length}</div>
              <div className="legacy-stat-label">Saved Crop Runs</div>
            </article>
            <article className="legacy-stat-card accent-blue">
              <div className="legacy-stat-value">{pestItems.length}</div>
              <div className="legacy-stat-label">Saved Pest Checks</div>
            </article>
            <article className="legacy-stat-card accent-purple">
              <div className="legacy-stat-value">{cropItems.length + pestItems.length}</div>
              <div className="legacy-stat-label">Total Recent Records</div>
            </article>
            <article className="legacy-stat-card accent-orange">
              <div className="legacy-stat-value">2</div>
              <div className="legacy-stat-label">Active Workflows</div>
            </article>
          </div>

          <div className="legacy-dashboard-section">
            <div className="legacy-dashboard-section-header">
              <h3 className="legacy-dashboard-section-title">Your Saved Crops</h3>
              <Link to="/crop" className="legacy-text-link">
                New Crop Recommendation
              </Link>
            </div>
            <div className="legacy-record-grid">
              {cropItems.length === 0 ? (
                <div className="legacy-empty-panel">No crops saved yet. Get recommendations to add activity to your dashboard.</div>
              ) : (
                cropItems.map((item) => (
                  <article key={item.id} className="legacy-card legacy-card-hover">
                    <h4 className="legacy-card-title">{item.primaryCrop?.name || "Unknown crop"}</h4>
                    <p className="legacy-card-copy">
                      {item.location?.district || "Unknown district"}, {item.location?.taluk || "Unknown taluk"}
                    </p>
                    <div className="legacy-record-meta">
                      <span>{item.season || "Unknown season"}</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="legacy-dashboard-section">
            <div className="legacy-dashboard-section-header">
              <h3 className="legacy-dashboard-section-title">Your Saved Pest Analyses</h3>
              <Link to="/pest" className="legacy-text-link">
                New Pest Detection
              </Link>
            </div>
            <div className="legacy-record-grid">
              {pestItems.length === 0 ? (
                <div className="legacy-empty-panel">No pest analyses yet. Upload a crop image to start saving results.</div>
              ) : (
                pestItems.map((item) => (
                  <article key={item.id} className="legacy-card legacy-card-hover">
                    <h4 className="legacy-card-title">{item.result?.scientificName || "Unknown pest"}</h4>
                    <p className="legacy-card-copy">{item.result?.commonNames || "Unknown common name"}</p>
                    <div className="legacy-record-meta">
                      <span>{item.result?.confidencePercent ?? 0}% confidence</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
