import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { cropApi, pestApi } from "../lib/api-client";

function formatDate(value) {
  if (!value) {
    return "Unknown time";
  }

  return new Date(value).toLocaleString();
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

  const totalActivity = cropItems.length + pestItems.length;
  const latestSource = [...cropItems, ...pestItems]
    .map((item) => item.meta?.source)
    .filter(Boolean)
    .slice(0, 1)[0];

  return (
    <section className="page">
      <div className="shell-container workspace-hero">
        <div>
          <p className="eyebrow">Operations dashboard</p>
          <h1 className="page-title">Welcome back, {user?.name || "farmer"}.</h1>
          <p className="lead-text">
            Monitor your recent crop recommendations and pest diagnoses from one place, with backend-backed history
            and workflow shortcuts ready for the next field run.
          </p>
        </div>

        <aside className="surface-card workspace-summary accent-surface">
          <p className="card-kicker">Workspace summary</p>
          <div className="stats-stack">
            <div className="summary-row">
              <strong>History state</strong>
              <span>{status === "ready" ? "Synchronized" : status === "loading" ? "Syncing" : "Needs attention"}</span>
            </div>
            <div className="summary-row">
              <strong>Recent source</strong>
              <span>{latestSource || "Awaiting data"}</span>
            </div>
            <div className="summary-row">
              <strong>Preferred workspace</strong>
              <span>{user?.preferredLanguage?.toUpperCase?.() || "EN"}</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="shell-container stats-row">
        <article className="surface-card stat-card">
          <p className="metric-label">Recent activity</p>
          <strong className="metric-value">{totalActivity}</strong>
          <p>Combined crop and pest records loaded into this dashboard session.</p>
        </article>
        <article className="surface-card stat-card">
          <p className="metric-label">Crop runs</p>
          <strong className="metric-value">{cropItems.length}</strong>
          <p>Latest recommendation records available from the protected crop history endpoint.</p>
        </article>
        <article className="surface-card stat-card">
          <p className="metric-label">Pest scans</p>
          <strong className="metric-value">{pestItems.length}</strong>
          <p>Most recent diagnosis uploads returned through the pest history endpoint.</p>
        </article>
      </div>

      {status === "loading" ? (
        <div className="shell-container">
          <div className="surface-card empty-state-card">
            <p className="card-kicker">Loading dashboard</p>
            <h3>Fetching recent field activity.</h3>
            <p>We are loading saved crop and pest records from the protected backend routes.</p>
          </div>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="shell-container">
          <div className="form-error">Unable to load dashboard history right now. Please refresh after the backend is reachable.</div>
        </div>
      ) : null}

      {status === "ready" ? (
        <div className="shell-container dashboard-grid">
          <section className="surface-card results-panel">
            <div className="section-heading">
              <div>
                <p className="card-kicker">Crop recommendations</p>
                <h3>Recent crop runs</h3>
              </div>
              <Link to="/crop" className="secondary-button inline-button">
                New crop run
              </Link>
            </div>

            {cropItems.length === 0 ? (
              <div className="empty-inline-state">
                <p className="state-copy">No crop recommendations yet. Start one from the crop workflow.</p>
              </div>
            ) : (
              <div className="history-stack">
                {cropItems.map((item) => (
                  <article key={item.id} className="history-card">
                    <div className="history-card-top">
                      <strong>{item.primaryCrop?.name || "Unknown crop"}</strong>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <p>
                      {item.location?.district || "Unknown district"}, {item.location?.taluk || "Unknown taluk"} |{" "}
                      {item.season || "Unknown season"} | {item.soilType || "Unknown soil"}
                    </p>
                    <div className="result-stats">
                      <span className="result-pill">{Math.round((item.primaryCrop?.score || 0) * 100)}% match</span>
                      <span className="result-pill result-pill-soft">{item.meta?.source || "ml-service"}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="surface-card results-panel">
            <div className="section-heading">
              <div>
                <p className="card-kicker">Pest analyses</p>
                <h3>Recent pest checks</h3>
              </div>
              <Link to="/pest" className="secondary-button inline-button">
                New pest scan
              </Link>
            </div>

            {pestItems.length === 0 ? (
              <div className="empty-inline-state">
                <p className="state-copy">No pest analyses yet. Upload an image from the pest workflow.</p>
              </div>
            ) : (
              <div className="history-stack">
                {pestItems.map((item) => (
                  <article key={item.id} className="history-card">
                    <div className="history-card-top">
                      <strong>{item.result?.scientificName || "Unknown pest"}</strong>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <p>{item.result?.commonNames || "Unknown common name"}</p>
                    <div className="result-stats">
                      <span className="result-pill">{item.result?.confidencePercent ?? 0}% confidence</span>
                      <span className="result-pill result-pill-soft">{item.meta?.source || "ml-service"}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="dashboard-sidebar">
            <div className="surface-card sidebar-card">
              <p className="card-kicker">Quick actions</p>
              <div className="action-stack">
                <Link to="/crop" className="secondary-button full-width">
                  Open crop workspace
                </Link>
                <Link to="/pest" className="secondary-button full-width">
                  Open pest workspace
                </Link>
              </div>
            </div>

            <div className="surface-card sidebar-card">
              <p className="card-kicker">System status</p>
              <div className="status-list">
                <div className="status-row">
                  <span>Auth session</span>
                  <strong>Active</strong>
                </div>
                <div className="status-row">
                  <span>History sync</span>
                  <strong>{status === "ready" ? "Healthy" : "Retrying"}</strong>
                </div>
                <div className="status-row">
                  <span>Primary source</span>
                  <strong>{latestSource || "Pending"}</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}

export default DashboardPage;
